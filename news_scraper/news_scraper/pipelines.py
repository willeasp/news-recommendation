# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
import elasticsearch


class NewsScraperPipeline:
    def process_item(self, item, spider):
        return item

class ElasticSearchPipeline:

    def __init__(self):
        self.es = elasticsearch.Elasticsearch("http://localhost:9200")

    def open_spider(self, spider):
        if not self.es.indices.exists(index="news"):
            spider.logger.info("Creating index news")
            self.es.indices.create(index="news", body={
                "mappings": {
                    "properties": {
                        "title": { "type": "text" },
                        "url": { "type": "keyword" },
                        "text": { "type": "text" },
                        "date": { "type": "date" }
                    }
                }
            })
        else:
            spider.logger.info("Index news already exists")

    def process_item(self, item, spider):

        # search for the url in the index
        res = self.es.search(index="news", body={"query": {"match": {"url": item['url']}}})
        # if the url is already in the index, we don't need to add it again
        if res['hits']['total']['value'] != 0:
            return item

        self.es.index(index="news", document=dict(item), op_type="create")

        return item