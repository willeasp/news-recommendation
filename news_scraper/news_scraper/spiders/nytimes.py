import scrapy
from datetime import datetime, timedelta
from news_scraper.items import NewsScraperItem


class NytimesSpider(scrapy.Spider):
    name = "nytimes"
    allowed_domains = ["www.nytimes.com"]

    def start_requests(self):
        base_url = "http://www.nytimes.com/sitemap/"

        for days in range(10):
            date = (datetime.now() - timedelta(days=days)).strftime("%Y/%m/%d")
            url = base_url + date
            yield scrapy.Request(url=url, callback=self.parse_day)

    def parse_day(self, response):
        urls = response.xpath('//main//li/a/@href').getall()
        for url in urls:
            yield response.follow(url=url, callback=self.parse_article)

    def parse_article(self, response):
        if not response.xpath('//article[@id="story"]'):
            return

        item = NewsScraperItem()
        item["url"] = response.url

        article = response.xpath('//article')
        item["title"] = article.xpath(".//h1/text()").get()
        item["text"] = '\n'.join(article.xpath(".//section//p/text()").getall())
        item["date"] = datetime.fromisoformat(article.xpath(".//time/@datetime").get())
        item["publisher"] = "nytimes"

        yield item
