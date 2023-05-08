import elasticsearch
import requests
import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import json

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

    # Ta emot dokument
    received_docs = request.args.get("documents")
    documents = json.loads(received_docs)

    # Kolla i loggen om dokumenten tas emot
    for doc in documents:
        print(doc["title"])

    # Bygg upp lista av dokument så som den borde vara i MoreLikeThis-delen sen <-- tror det är detta som blir fel på något sätt (?)
    documents_list = [{"title": doc["title"], "text": doc["text"]}
                      for doc in documents]

    # Elasticsearch_DSL's "Search" metod verkar behöva användas för MoreLikeThis
    es_search = Search(index='news').using(es)

    results = es_search.query(MoreLikeThis(
        like=documents_list,  # Lista av dokument istället för bara ett dokument
        fields=["title", "text"],
        min_term_freq=1,
        min_doc_freq=1))

    # Elasticsearch_DSL ger ut svaren i annat format så behöver konverteras
    res = results.execute().to_dict()

    # Samma som för vanlig sökning
    return jsonify(res)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
