import locale
from datetime import datetime

import scrapy
from news_scraper.items import NewsScraperItem


class AftonbladetSpider(scrapy.Spider):
    name = "aftonbladet"
    allowed_domains = ["www.aftonbladet.se"]

    def start_requests(self):
        for page_id in range(50):
            yield scrapy.Request(url=f"https://www.aftonbladet.se/nyheter?pageId={str(page_id)}", callback=self.parse)

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

        time_str = article.xpath('.//time/@aria-label').get()
        format_str = "Publicerad: %d %B %Y kl. %H.%M"

        # Set the locale to Swedish
        locale.setlocale(locale.LC_ALL, 'sv_SE.UTF-8')

        # Parse the time string into a datetime object
        item['date'] = datetime.strptime(time_str, format_str)

        item['publisher'] = "aftonbladet"

        yield item