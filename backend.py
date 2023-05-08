import elasticsearch

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


es = elasticsearch.Elasticsearch(["http://localhost:9200"])


@app.route("/search", methods=["POST"])
@cross_origin(origins="*")
def search():
    query = request.args.get("query")

    relevant = request.json["relevant"]

    must = [ { "multi_match": {
        "query": query,
        "fields": [
            "title^3",
            "text",
        ],
        "fuzziness": "AUTO",
    } } ]

    if relevant:
        must.append({ "more_like_this": {
            "fields": ["title", "text"],
            "like": [ { "_index": "news", "_id": id } for id in relevant ],
            "min_term_freq": 1,
            "max_query_terms": 12
        } } )

    body = { "query": { "bool": { "must": must } } }

    res = es.search(index="news", body=body, headers={
        "Content-Type": "application/json"
    })

    return jsonify(res.body)


@app.route("/latest", methods=["GET"])
@cross_origin(origins="*")
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

    return jsonify(res.body)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
