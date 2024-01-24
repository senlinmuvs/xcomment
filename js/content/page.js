document.addEventListener('DOMContentLoaded', function() {
    // console.log('page.js', location.href);
    if(location.pathname.startsWith('/t/')) {
        //content -> inject
        window.postMessage({action: 'CMD_LOADED'}, '*');
    }
});