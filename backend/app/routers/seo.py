from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response

from app.config import settings

router = APIRouter()

# Every public frontend route. Customer ledgers live in the browser, so they're not listed.
ROUTES = [("/", "1.0", "daily"), ("/bill", "0.8", "weekly"), ("/help", "0.7", "monthly"), ("/settings", "0.4", "monthly")]


@router.get("/sitemap.xml")
def sitemap():
    urls = "".join(
        f"<url><loc>{settings.site_url}{path}</loc><changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        for path, prio, freq in ROUTES
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>'
    return Response(xml, media_type="application/xml")


@router.get("/robots.txt", response_class=PlainTextResponse)
def robots():
    return f"User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /customer/\n\nSitemap: {settings.site_url}/sitemap.xml\n"
