import scrapy
from news_scraper.items import NewsScraperItem
from datetime import datetime


class AftonbladetSpider(scrapy.Spider):
    name = "aftonbladet"
    allowed_domains = ["www.aftonbladet.se"]
    start_urls = ["https://www.aftonbladet.se/tagg/listor"]

    def parse(self, response):
        urls = response.xpath('//*[@id="main"]//main/section//a/@href')

        for url in urls:
            yield response.follow(url, callback=self.parse_article)

    def parse_article(self, response):
        item = NewsScraperItem()
        article = response.xpath('//article')
        if not article:
            article = response.xpath('//section')

        item['url'] = response.url
        item['title'] = article.xpath('.//h1/text()').get()
        item['text'] = article.xpath('.//p/text()').getall()

        # parse date as datetime in the format dd Month yyyy where month is in swedish
        date = article.xpath('.//time/strong[2]/text()').get()
        date = date.split()
        date[1] = self.month_to_number(date[1])
        item['date'] = datetime(int(date[2]), int(date[1]), int(date[0]))

        yield item




    def month_to_number(self, datestring: str):
        months = {
            'januari': '01',
            'februari': '02',
            'mars': '03',
            'april': '04',
            'maj': '05',
            'juni': '06',
            'juli': '07',
            'augusti': '08',
            'september': '09',
            'oktober': '10',
            'november': '11',
            'december': '12'
        }
        return int(months[datestring.lower()])



