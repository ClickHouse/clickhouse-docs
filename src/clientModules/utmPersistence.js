import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

function putUTMsInStorage() {
    const expirationTime = new Date()
    expirationTime.setDate(expirationTime.getDate() + 14) // Set expiration to 14 days from now

    const urlParams = new URLSearchParams(window.location.search)
    const utmValues = {}

    // Convert iterator to array
    Array.from(urlParams.entries()).forEach(([key, value]) => {
        if (key.startsWith('utm_') || key === 'gclid') {
            utmValues[key] = value
        }
    })

    // No values, don't save
    if (!Object.keys(utmValues).length) return

    // Save values
    window.localStorage.setItem('ch-utms', JSON.stringify({
        data: utmValues,
        timestamp: expirationTime.getTime()
    }))
}

function putPagePathsInStorage() {
    const currentPath = window.location.pathname

    // Already has value, abort
    if (window.localStorage.getItem('origPath')) return

    // Save value
    window.localStorage.setItem('origPath', currentPath)
}

function getUTMsFromStorage() {
    const utms = window.localStorage.getItem('ch-utms')
    if (utms) {
        const { data, timestamp } = JSON.parse(utms)
        const convertedTimestamp = new Date(parseInt(timestamp))
        const dateNow = new Date()

        // Handle expired UTMS
        if (dateNow.getTime() > convertedTimestamp.getTime()) {
            window.localStorage.removeItem('ch-utms')
            return null
        }

        return data
    }

    return null
}

function getGoogleAnalyticsCookie() {
    // Get all cookies in the format "cookieName=cookieValue; ..."
    const cookies = document.cookie.split(';')

    // Loop through each cookie
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()

        // Check if the cookie starts with "_ga="
        if (cookie.startsWith('_ga=')) {
            // Return the value part, which is everything after "_ga="
            return cookie.substring(4)
        }
    }

    return null
}

function appendUTMsToLink(url) {
    const utms = getUTMsFromStorage()
    const urlObject = new URL(url, window.location.toString())
    if (utms) {
        Object.entries(utms).forEach(([key, value]) => {
            urlObject.searchParams.set(key, value)
        })
    }
    return urlObject.toString()
}

function appendPagePathsToLink(url) {
    const urlObject = new URL(url)

    // Append current page path
    urlObject.searchParams.set('pagePath', window.location.pathname)

    // Append original page path from local storage if available
    const origPath = window.localStorage.getItem('origPath')
    if (origPath) {
        urlObject.searchParams.set('origPath', origPath)
    }

    return urlObject.toString()
}

function appendGoogleAnalyticsCookieToLink(url) {
    const cookieValue = getGoogleAnalyticsCookie()

    if (!cookieValue) return url

    const urlObject = new URL(url)
    urlObject.searchParams.set('utm_ga', cookieValue)
    return urlObject.toString()
}

function appendGalaxySessionIDToLink(url) {
    const galaxy_id = window?.galaxy?.getSessionId() || null

    if (!galaxy_id) return url

    const urlObject = new URL(url)
    urlObject.searchParams.set('glxid', galaxy_id)
    return urlObject.toString()
}

function updateLinks() {

    // First, gather data
    putUTMsInStorage() // Take UTMs from the URL and update local storage
    putPagePathsInStorage() // Save origPath

    // Next, append gathered data to cloud links
    Array.from(document.querySelectorAll('a[href*=".cloud"]')).forEach(el => {
        try {
            let href = el.href
            href = appendUTMsToLink(href)
            href = appendGalaxySessionIDToLink(href)
            href = appendPagePathsToLink(href)
            href = appendGoogleAnalyticsCookieToLink(href)
            el.href = href
        } catch {}
    });
}


if (ExecutionEnvironment.canUseDOM) {
    const observer = new MutationObserver(() => {
        updateLinks()
    });

    // Observe the entire body for DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false // Set to false, allows us to update the href without causing an infinite loop
    });
}