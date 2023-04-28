import elasticsearch
import requests
import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

from elasticsearch_dsl import Search
from elasticsearch_dsl.query import MoreLikeThis

app = Flask(__name__)
CORS(app)


def es_create_index_if_not_exists(es, index):
    """Create the given ElasticSearch index and ignore error if it already exists"""
    try:
        print("Try to create index")
        es.indices.create(index)
        print("Inserting movie metadata")
        insert_movies("movie_metadata.csv")
    except elasticsearch.exceptions.RequestError as ex:
        print("Index already exists")
        if ex.error == 'resource_already_exists_exception':
            pass  # Index already exists. Ignore.
        else:  # Other exception - raise it
            raise exnodes


def insert_movies(filename):
    # open the CSV file and read the rows
    with open(filename, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # extract the movie data from the row
            movie = {
                "name": row["movie_title"],
                "actors": row["actor_1_name"],
                "genre": row["genres"],
                "release_date": row["title_year"]
            }

            # insert the movie into the Elasticsearch index
            es.index(index="movies", body=movie)


es = elasticsearch.Elasticsearch(["http://localhost:9200"])
es_create_index_if_not_exists(es, "movies")


def filter_movies(name, actors, genre, date):
    query = {
        "query": {
            "bool": {
                "must": []
            }
        }
    }
    headers = {
        "Content-Type": "application/json"
    }

    if name:
        query["query"]["bool"]["must"].append({
            "match": {
                "name": name
            }
        })
    if actors:
        query["query"]["bool"]["must"].append({
            "match": {
                "actors": actors
            }
        })
    if genre:
        query["query"]["bool"]["must"].append({
            "match": {
                "genre": genre
            }
        })
    if date:
        query["query"]["bool"]["must"].append({
            "match": {
                "release_date": date
            }
        })

    res = es.search(index="movies", body=query, headers={
        "Content-Type": "application/json"
    })
    return res["hits"]["hits"]


def get_movie_poster(name):
    # make a GET request to the OMDb API to get the movie poster
    res = requests.get(
        "http://www.omdbapi.com/",
        params={
            "apikey": "74e22e02",
            "t": name,
            "i": "tt3896198"
        }
    )

    # extract the movie poster URL from the response
    try:
        print(res.json())
        poster_url = res.json()["Poster"]
    except Exception as e:
        error_message = traceback.format_exc()
        print(error_message)
        poster_url = ""

    return poster_url


@app.route("/search", methods=["GET"])
def search():
    # get the search query from the request query parameters
    name = request.args.get("name")
    actors = request.args.get("actors")
    genre = request.args.get("genre")
    date = request.args.get("date")

    print("in search")
    # filter the movies
    movies = filter_movies(name, actors, genre, date)

    # get the movie posters
    for movie in movies:
        movie["_source"]["poster_url"] = get_movie_poster(
            movie["_source"]["name"])

    return jsonify({
        "hits": {
            "hits": movies
        }
    })


@app.route("/poster", methods=["GET"])
def poster():
    # get the movie name from the request query parameters
    name = request.args.get("name")

    # get the movie poster URL
    poster_url = get_movie_poster(name)

    return poster_url


@app.route("/insert", methods=["POST"])
def insert():
    # get the movie data from the request body
    movie_data = request.json

    # insert the movie into Elasticsearch
    res = es.index(index="movies", body=movie_data)

    return jsonify({
        "result": "success",
        "id": res["_id"]
    })

# Rekommendationsfunktionen


@app.route("/recommend", methods=["GET", "POST"])
def recommend():

    app.logger.info('Received request: %s %s', request.method, request.url)

    # Ta ut fält från filmen som ska rekommenderas efter
    # name = request.json['name']
    actors = request.json['actors']
    genre = request.json['genre']
    # release_date = request.json['release_date']

    # Elasticsearch_DSL's "Search" metod verkar behöva användas för MoreLikeThis
    es_search = Search(index='movies').using(es)

    results = es_search.query(MoreLikeThis(
        # Det ska gå att ha listor i "like" också om man vill jämföra med mer än en sak men går inte riktigt att göra med film-systemet
        like=[actors, genre],
        fields=["actors", "genre"],  # Fält att jämföra med
        min_term_freq=1,
        min_doc_freq=1))

    # Elasticsearch_DSL ger ut svaren i annat format så behöver konverteras
    res = results.execute().to_dict()

    # Samma som för vanlig sökning
    movies = res["hits"]["hits"]
    for movie in movies:
        movie["_source"]["poster_url"] = get_movie_poster(
            movie["_source"]["name"])
    return jsonify({
        "hits": {
            "hits": movies
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
