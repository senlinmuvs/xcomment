setTimeout(() => {
    // console.log('install.js', location.href);
    if(location.pathname.startsWith('/t/')) {
        loadJS("/js/inject/v2ex.js");
        loadStyles("/css/inject/v2ex.css");
    }
});

function loadJS(url) {
    const pageScript = document.createElement('script');
    pageScript.setAttribute('type', 'text/javascript');
    pageScript.setAttribute('src', chrome.extension.getURL(url));
    pageScript.defer = true;
    document.head.appendChild(pageScript);   
}
function loadStyles(url) {
	var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.extension.getURL(url);
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
}