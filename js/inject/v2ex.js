window.addEventListener("message", function (e){
    if (e.data.action === 'CMD_LOADED') {
        start();
    }
}, false);

let _comments = [];
function start() {
    let cmts = $('#Main .box:eq(1) .cell:gt(0):not(.ps_container)');
    // console.log(cmts.length);
    for(let i = 0; i < cmts.length; i++) {
        let cmt = cmts[i];
        let user = $('.dark', cmt).text();
        let fl = $('.no', cmt).text();
        let id = cmt.id;
        let cont_ = $('.reply_content', cmt);
        let cont = cont_.text();
        let item = {
            id: id,
            user: user, 
            fl: fl,
            cont: cont.substring(0, 30)
        };
        beautify(i, item, cont_, cmt);
        _comments[_comments.length] = item;
    }
}
function beautify(i, item, cont_, cmt) {
    // if(i !== 29) {
    //     return;
    // }
    let h = cont_.html();
    // console.log(h, cont_[0]);
    if(h.indexOf('@') >= 0) {
        // console.log(id, fl, user, cont);
        let tag = '@<a';
        let arr = h.split(tag);
        let newHtml = '';
        for(let i = 0; i < arr.length; i++) {
            let it = arr[i];
            if(!it) {
                continue;
            }
            let refUser = extratRefUser(it);
            if(refUser) {
                let cont = extratCont(it);
                if(cont.startsWith('<br>')) {
                    cont = cont.substring(4);
                }
                let refItem = findItemByUser(refUser);
                let refId = refItem.id;
                let refCont = refItem.cont + ' #' + refItem.fl;
                // console.log(it);
                // console.log(refUser, cont, refId, refCont);
                cont = replaceImg(cont);
                newHtml += '<div class="_ref">@<a href="/member/'+refUser+'">'+refUser+'</a> <a class="_ref_cont" href="javascript:_go(\''+refId+'\');" style="color:#a9a9a9;">'+refCont+'</a></div>' + 
                        '<div class="_cont">'+cont+'</div>';
            } else {
                it = replaceImg(it);
                if(it.indexOf("href=\"") >= 0) {
                    newHtml += tag+it;
                } else {
                    newHtml += it;
                }
            }
        }
        $('.reply_content', cmt).html(newHtml);
    }
}
//![a](b.jpg)
function replaceImg(s) {
    let fromIndex = 0;
    let tag0 = "![";
    let tag1 = ")";
    while(true) {
        let arr = extractByTag(s, fromIndex, tag0, tag1);
        // console.log(arr);
        if(!arr || arr.length < 2) {
            break;
        }
        let imgMD = arr[0];
        fromIndex = arr[1] + 1;
        let src = extractSrc(imgMD);
        let img = '<img style="max-width:100%;" src="'+src+'"/>';
        // console.log(imgMD, img);
        s = s.replace(imgMD, img);
    }
    return s;
}
//hello ![a](b.jpg) xxxx
function extractByTag(s, fromIndex, tag0, tag1) {
    let start = -1;
    let end = -1;
    let tmpS = "";
    let foundTag0 = false;
    for(let i = fromIndex; i < s.length; i++) {
        tmpS += s[i];
        if(foundTag0) {
            if(tmpS === tag1) {
                end = i;
                break;
            }
            if(!tag1.startsWith(tmpS)) {
                tmpS = "";
            }
        } else {
            if(tmpS === tag0) {
                foundTag0 = true;
                start = i-tag0.length+1;
            }
            if(!tag0.startsWith(tmpS)) {
                tmpS = "";
            }
        }
    }
    // console.log(start, end, foundTag0, tmpS);
    if(start >= 0 && end >= 0 && start < end) {
        return [s.substring(start, end+1), end];
    }
    return null;
}

function extractSrc(s) {
    let arr = extractByTag(s, 0, "(", ")");
    // console.log(arr);
    if(arr && arr.length > 0) {
        return arr[0].substring(1, arr[0].length-1).trim();
    }
    return "";
}
function findItemByUser(user) {
    for(let i = _comments.length-1; i >= 0; i--) {
        let it = _comments[i];
        if(it.user === user) {
            return it;
        }
    }
    return null;
}
//@<a href="/member/aks">aks</a> <br>
function extratRefUser(s) {
    let tag0 = '">';
    let tag1 = '</';
    let i0 = s.indexOf(tag0);
    if(i0 >= 0) {
        let i1 = s.indexOf(tag1);
        if(i1 >= 0) {
            if(i0 < i1) {
                return s.substring(i0+tag0.length, i1);
            }
        }
    }
    return '';
}
//@<a href="/member/aks">aks</a> <br>
function extratCont(s) {
    let tag0 = '/a> ';
    let i0 = s.indexOf(tag0);
    // console.log('>>>>>', s, i0);
    if(i0 >= 0) {
        return s.substring(i0+tag0.length);
    }
    return '';
}
function _go(id) {
    location.href = location.origin + location.pathname + location.search + '#'+id;
    $('#'+id).css('background-color', '#eaeaea');
    setTimeout(function(){
        $('#'+id).css('background-color', '');
    }, 900);
}