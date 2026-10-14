fetch('https://api.unsplash.com/search/photos?query=portrait+person+face&page=1&per_page=5&orientation=portrait&content_filter=high', {
    headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || ''}`
    }
})
.then(res => {
    console.log("Status:", res.status);
    return res.json();
})
.then(data => console.log(JSON.stringify(data, null, 2).substring(0, 1000)))
.catch(err => console.error(err));
