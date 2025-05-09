from fastapi import FastAPI, Request
from playwright.async_api import async_playwright
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"message": "Hello from the Cart backend"}

@app.post("/scrape")
async def scrape_product(request: Request):
    body = await request.json()
    url = body.get("url")

    print(f"Received URL to scrape: {url}") 

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)

        # Helper function to extract content from multiple selectors
        async def get_meta_content(selectors):
            for selector in selectors:
                element = await page.query_selector(selector)
                if element:
                    content = await element.get_attribute("content")
                    if content:
                        return content
            return None

        # Define possible selectors for each field
        title_selectors = [
            'meta[property="og:title"]',
            'meta[name="title"]',
            'meta[itemprop="name"]'
        ]
        image_selectors = [
            'meta[property="og:image"]',
            'meta[name="image"]',
            'meta[itemprop="image"]'
        ]
        price_selectors = [
            'meta[property="product:price:amount"]',
            'meta[property="og:price:amount"]',
            'meta[itemprop="price"]'
        ]
        currency_selectors = [
            'meta[property="product:price:currency"]',
            'meta[property="og:price:currency"]',
            'meta[itemprop="priceCurrency"]'
        ]

        # Extract data using the helper function
        title = await get_meta_content(title_selectors)
        image_url = await get_meta_content(image_selectors)
        price = await get_meta_content(price_selectors)
        currency = await get_meta_content(currency_selectors)

        await browser.close()

        return {
            "title": title or "Title not found",
            "price": price or "Price not found",
            "currency": currency or "Currency not found",
            "image_url": image_url or "Image not found"
        }
