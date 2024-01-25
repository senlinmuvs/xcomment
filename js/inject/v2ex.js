window.addEventListener("message", function (e){
    if (e.data.action === 'CMD_LOADED') {
        _start();
    }
}, false);

let _comments = [];
function _start() {
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
        _beautify(i, item, cont_, cmt);
        _comments[_comments.length] = item;
    }
    //
    // let subjectImgs = $('#Main .box:eq(0) img.embedded_image');
    // subjectImgs.each(function(i, it){
    //     _beautifyImg(it);
    // });
}
function _beautify(i, item, cont_, cmt) {
    // if(i !== 20) {
    //     return;
    // }
    let h = cont_.html();
    // console.log(h, cont_[0]);
    let newHtml = '';
    //
    let existsRef = h.indexOf('@') >= 0;
    if(existsRef) {
        // console.log(id, fl, user, cont);
        let tag = '@<a';
        let arr = h.split(tag);
        for(let i = 0; i < arr.length; i++) {
            let it = arr[i];
            if(!it) {
                continue;
            }
            let refUser = _extratRefUser(it);
            if(refUser) {
                let cont = _extratCont(it);
                if(cont.startsWith('<br>')) {
                    cont = cont.substring(4);
                }
                let refItem = _findItemByUser(refUser);
                let refId = refItem.id;
                let refCont = refItem.cont + ' #' + refItem.fl;
                // console.log(it);
                // console.log(refUser, cont, refId, refCont);
                newHtml += '<div class="_ref">@<a href="/member/'+refUser+'">'+refUser+'</a> <a class="_ref_cont" href="javascript:_go(\''+refId+'\');" style="color:#a9a9a9;">'+refCont+'</a></div>' + 
                        '<div class="_cont">'+cont+'</div>';
            } else {
                if(it.indexOf("href=\"") >= 0) {
                    newHtml += tag+it;
                } else {
                    newHtml += it;
                }
            }
        }
    }
    //
    let existsMDImg = h.indexOf('![') >= 0;
    if(existsMDImg) {
        // console.log(h);
        newHtml = _replaceImg(h);
    }
    //
    let existsImg = h.indexOf('<img') >= 0;
    if(existsImg) {
        $('img', cont_).each(function(i, it){
            _beautifyImg(it);
        });
    }

    if(newHtml) {
        $('.reply_content', cmt).html(newHtml);
    }
}
function _beautifyImg(it) {
    // console.log(i, it);
    let p = $(it).parent();
    if(p.length > 0) {
        let a = p;
        // console.log(a, a[0].nodeName);
        // if(a[0].nodeName === 'A') {
            a.href = 'javascript:_view("'+it.src+'");';
            a.removeAttr('target');
        // } else {
        //     console.log(it, it.src);
        //     a = $('<a href="javascript:_view(\''+it.src+'\');"></a>');
        //     a.append($(it).clone());
        //     console.log(a);
        //     it.before(a);
        //     // it.remove();
        // }
    }
}
//![a](b.jpg)
function _replaceImg(s) {
    let fromIndex = 0;
    let tag0 = "![";
    let tag1 = ")";
    while(true) {
        let arr = _extractByTag(s, fromIndex, tag0, tag1);
        // console.log(arr);
        if(!arr || arr.length < 2) {
            break;
        }
        let imgMD = arr[0];
        fromIndex = arr[1] + 1;
        let src = _extractSrc(imgMD);
        //如果是个链接
        if(src.startsWith("<a")) {
            let t0 = 'href="';
            let t1 = '"';
            let arr = _extractByTag(src, 0, t0, t1);
            if(arr && arr.length > 1) {
                src = arr[0].substring(t0.length, arr[0].length-t1.length);
            }
        }
        let img = '<a href="javascript:_view(\''+src+'\');"><img style="max-width:100%;" src="'+src+'"/></a>';
        // console.log(imgMD, img);
        s = s.replace(imgMD, img);
    }
    return s;
}
//hello ![a](b.jpg) xxxx
function _extractByTag(s, fromIndex, tag0, tag1) {
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

function _extractSrc(s) {
    let arr = _extractByTag(s, 0, "(", ")");
    // console.log(arr);
    if(arr && arr.length > 0) {
        return arr[0].substring(1, arr[0].length-1).trim();
    }
    return "";
}
function _findItemByUser(user) {
    for(let i = _comments.length-1; i >= 0; i--) {
        let it = _comments[i];
        if(it.user === user) {
            return it;
        }
    }
    return null;
}
//@<a href="/member/aks">aks</a> <br>
function _extratRefUser(s) {
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
function _extratCont(s) {
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
function _view(img) {
    let div = '<div class="_win_view"><img src="'+img+'"/></div>';
    $(document.body).append(div);
    $('._win_view').on('click', function(e){
        $(this).remove();
    });
}