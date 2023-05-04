from datetime import datetime

import scrapy
from news_scraper.items import NewsScraperItem


class AftonbladetSpider(scrapy.Spider):
    name = "aftonbladet"
    allowed_domains = ["www.aftonbladet.se"]

    def start_requests(self):
        for page_id in range(10):
            yield scrapy.Request(url=f"https://www.aftonbladet.se/nyheter?pageID={str(page_id)}", callback=self.parse)

    def parse(self, response):
        articles = response.xpath('//*[@id="main"]/div[1]/main/section/*')

        for article in articles:
            # if the article contains an svg, it is not a premium article and we can access it
            if article.xpath('.//svg').get() is None:
                continue

            url = article.xpath('.//a/@href').get()
            yield response.follow(url, callback=self.parse_article)

    def parse_article(self, response):
        item = NewsScraperItem()
        article = response.xpath('//article')

        item['url'] = response.url
        # if the url contains "podcast" skip the item
        if "podcast" in item['url']:
            return

        item['title'] = article.xpath('.//h1/text()').get()
        # if the title is None, it's aftonbladet live and we don't want it
        if item['title'] is None:
            return

        item['text'] = "\n".join(article.xpath('.//p/text()').getall())

        # parse date as datetime in the format dd Month yyyy where month is in swedish
        try:
            date = article.xpath('.//time/strong[2]/text()').get()
            date = date.split()
            date[1] = self.month_to_number(date[1])
            item['date'] = datetime(int(date[2]), int(date[1]), int(date[0]))
        except:
            item['date'] = datetime.today()

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
