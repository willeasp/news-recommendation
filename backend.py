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

es = elasticsearch.Elasticsearch(["http://localhost:9200"])

@app.route("/search", methods=["GET"])
def search():
    # get the search query from the request query parameters
    title = request.args.get("title")

    print("in search")

    query = {
        "query": {
            "multi_match": {
                "query": title,
                "fields": [
                    "title^3",
                    "text",
                ],
                "fuzziness": "AUTO",
            }
        }
    }

    res = es.search(index="news", body=query, headers={
        "Content-Type": "application/json"
    })

    return jsonify(res)


# Rekommendationsfunktionen
@app.route("/recommend", methods=["GET", "POST"])
def recommend():

    # app.logger.info('Received request: %s %s', request.method, request.url)

    # Ta ut fält från filmen som ska rekommenderas efter
    # name = request.json['name']
    title = request.args.get("title")
    text = request.args.get("text")

    print(title)
    # release_date = request.json['release_date']

    # Elasticsearch_DSL's "Search" metod verkar behöva användas för MoreLikeThis
    es_search = Search(index='news').using(es)

    results = es_search.query(MoreLikeThis(
        # Det ska gå att ha listor i "like" också om man vill jämföra med mer än en sak men går inte riktigt att göra med film-systemet
        like=[title, text],
        fields=["title", "text"],  # Fält att jämföra med
        min_term_freq=1,
        min_doc_freq=1))

    # Elasticsearch_DSL ger ut svaren i annat format så behöver konverteras
    res = results.execute().to_dict()

    # Samma som för vanlig sökning

    return jsonify(res)


@app.route("/latest", methods=["GET"])
def latest():
    # get the (size) latest articles from the request query parameters
    size = request.args.get("size")

    # get the size latest articles from the index using the date field
    res = es.search(index="news", body={
        "query": {
            "match_all": {}
        },
        "sort": [
            {
                "date": {
                    "order": "desc"
                }
            }
        ],
        "size": size
    })

    return jsonify(res)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
