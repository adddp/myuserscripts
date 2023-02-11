// ==UserScript==
// @name             网易云:音乐/歌词下载,云盘快速上传周杰伦
// @namespace     https://github.com/Cinvin/myuserscripts
// @license           MIT
// @version           0.3.2
// @description     在歌曲页面歌曲和歌词下载,在个人主页一键云盘上传解锁周杰伦
// @author            cinvin
// @match            https://music.163.com/*
// @grant             GM_download
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const weapiRequest=unsafeWindow.NEJ.P("nej.j").be0x
    if (location.href.match('song')){
        //song
        let cvrwrap=document.querySelector(".cvrwrap")
        if(cvrwrap){
            let songId=Number(location.href.match(/\d+$/g));
            let songTitle=document.head.querySelector("[property~='og:title'][content]").content;
            if(!document.querySelector(".u-btni-play-dis")){
                let newItem = document.createElement('div');
                newItem.className="out s-fc3"
                let dl = document.createElement('a');
                dl.text = '歌曲下载';
                dl.className="des s-fc7"
                dl.addEventListener('click', () => {
                    dwonloadSong(songId,songTitle,dl)
                })
                newItem.appendChild(dl)
                cvrwrap.appendChild(document.createElement('br'))
                cvrwrap.appendChild(newItem)
            }
            //lyric
            weapiRequest("/api/song/lyric", {
                type: "json",
                query: {
                    id: songId,
                    tv: -1,
                    lv: -1,
                    rv: -1,
                    kv: -1,
                },
                onload: function(content) {
                    let lyricObj=content
                    GM_setValue('lyric',content)
                    if(content.romalrc.lyric.length>0){
                        let lrcShowItem = document.createElement('div');
                        lrcShowItem.className="out s-fc3"
                        let p = document.createElement('p');
                        p.innerHTML = '歌词显示:';
                        let tl = document.createElement('a');
                        tl.text = '翻译';
                        tl.className="des s-fc7"
                        tl.addEventListener('click', () => {
                            switchLyric('tlyric');
                        })
                        p.appendChild(tl)
                        let span=document.createElement('span')
                        span.innerHTML = ' / ';
                        p.appendChild(span)
                        let rl = document.createElement('a');
                        rl.text = '罗马音';
                        rl.className="des s-fc7"
                        rl.addEventListener('click', () => {
                            switchLyric('romalrc');
                        })
                        p.appendChild(rl)
                        lrcShowItem.appendChild(p)
                        cvrwrap.appendChild(document.createElement('br'))
                        cvrwrap.appendChild(lrcShowItem)
                    }
                    let lrcDownloadItem = document.createElement('div');
                    lrcDownloadItem.className="out s-fc3"
                    let p = document.createElement('p');
                    p.innerHTML = '歌词下载:';
                    let lrc = document.createElement('a');
                    lrc.text = '原词';
                    lrc.className="des s-fc7"
                    lrc.addEventListener('click',() =>{
                        downloadLyric('lrc',songTitle)
                    })
                    p.appendChild(lrc)
                    if(content.tlyric.lyric.length>0){
                        let span=document.createElement('span')
                        span.innerHTML = ' / ';
                        p.appendChild(span)
                        let tlyric = document.createElement('a');
                        tlyric.text = '原词+翻译';
                        tlyric.className="des s-fc7"
                        tlyric.addEventListener('click',() =>{
                            downloadLyric('lrc-tlyric',songTitle)
                        })
                        p.appendChild(tlyric)
                    }
                    if(content.romalrc.lyric.length>0){
                        let span=document.createElement('span')
                        span.innerHTML = ' / ';
                        p.appendChild(span)
                        let romalrc = document.createElement('a');
                        romalrc.text = '原词+罗马音';
                        romalrc.className="des s-fc7"
                        romalrc.addEventListener('click',() =>{
                            downloadLyric('lrc-romalrc',songTitle)
                        })
                        p.appendChild(romalrc)
                    }
                    lrcDownloadItem.appendChild(p)
                    cvrwrap.appendChild(document.createElement('br'))
                    cvrwrap.appendChild(lrcDownloadItem)
                },
            });
        }
    }
    function levelDesc(level) {
        switch (level) {
            case 'standard':
                return '标准'
            case 'higher':
                return '较高'
            case 'exhigh':
                return '极高'
            case 'lossless':
                return '无损'
            case 'hires':
                return 'Hi-Res'
            default:
                return level
        }
    }
    function dwonloadSong(songId,songTitle,dlbtn){
        weapiRequest("/api/song/enhance/player/url/v1", {
            type: "json",
            query: {
                ids: JSON.stringify([songId]),
                level: 'hires',
                encodeType: 'flac'
            },
            onload: function(content) {
                // console.log(content)
                if(content.data[0].code==200){
                    var filename=songTitle+'.'+content.data[0].type.toLowerCase();
                    var dlurl=content.data[0].url
                    var size=content.data[0].size
                    var level=levelDesc(content.data[0].level)
                    GM_download({
                        url: dlurl,
                        name: filename,
                        onprogress:function(e){
                            dlbtn.text=`正在下载${level}品质音乐... (${Math.round(e.loaded/e.totalSize*10000)/100}%)`
                                        },
                        onload: function () {
                            dlbtn.text='下载'
                        },
                        onerror :function(){
                            dlbtn.text='下载失败'
                        }
                    });
                }
                else{
                    dlbtn.text='获取下载链接失败 可能无下载权限';
                }
            },
            onerror: function(content) {
                console.log(content)
            }
        });
    }
    function switchLyric(type) {
        let lyric=GM_getValue('lyric')
        let lyric1=lyric.lrc.lyric
        let lyric2=null
        switch (type) {
            case 'tlyric':
                lyric2=lyric.tlyric.lyric
                break
            case 'romalrc':
                lyric2=lyric.romalrc.lyric
                break
        }
        let lyric_content=document.querySelector("#lyric-content")
        let songId=Number(location.href.match(/\d+$/g));
        let lyrictimelines=unsafeWindow.NEJ.P("nm.ut").bFK0x(lyric1, lyric2);
        let a9j = unsafeWindow.NEJ.P("nej.e")
        a9j.dm1x(lyric_content, "m-lyric-content", {
            id: songId,
            nolyric: lyric.nolyric,
            limit: lyric2 ? 6 : 13,
            lines: lyrictimelines.lines,
            scrollable: lyrictimelines.scrollable,
            thirdCopy: a9j.v0x(lyric_content, "thirdCopy") == "true",
            copyFrom: a9j.v0x(lyric_content, "copyFrom")
        });
        lyric.scrollable = lyrictimelines.scrollable;
        lyric.songId = songId;
        //a9j.dm1x("user-operation", "m-user-operation", lyric);
        unsafeWindow.NEJ.P("nej.v").s0x("flag_ctrl", "click", () => {
            var bBc9T = a9j.A0x("flag_more");
            if (a9j.bE0x(bBc9T, "f-hide")) {
                a9j.x0x(bBc9T, "f-hide");
                a9j.A0x("flag_ctrl").innerHTML = '收起<i class="u-icn u-icn-70"></i>'
            } else {
                a9j.w0x(bBc9T, "f-hide");
                a9j.A0x("flag_ctrl").innerHTML = '展开<i class="u-icn u-icn-69"></i>'
            }
        })
    }
    function downloadLyric(type,songTitle){
        let lyric=GM_getValue('lyric')
        let content=lyric.lrc.lyric
        if (type=='lrc-tlyric'){
            content=combineLyric(lyric.lrc.lyric,lyric.tlyric.lyric)
        }
        else if (type=='lrc-romalrc'){
            content=combineLyric(lyric.lrc.lyric,lyric.romalrc.lyric)
        }
        let lrc = document.createElement('a');
        let data=new Blob([content], {type:'type/plain'})
        let fileurl = URL.createObjectURL(data)
        lrc.href=fileurl
        lrc.download=songTitle+'.lrc'
        lrc.click()
        URL.revokeObjectURL(data);
    }
    function combineLyric(lyric1,lyric2){
        let lyrictimelines=unsafeWindow.NEJ.P("nm.ut").bFK0x(lyric1, lyric2);
        let content=''
        lyrictimelines.lines.forEach(line=>{
            let linecontent=`[${line.tag}] ${line.lyric}`
            linecontent=linecontent.replace('<br>','\n').trim()+'\n'
            content=content+linecontent
        })
        return content.trim()
    }
    function showPopUp(msg){
        unsafeWindow.NEJ.P("nm.x").iQ3x(msg);
    }
    function showTips(tip,type){
        //type:1 √ 2:!
        unsafeWindow.NEJ.P("nm.l").bb0x.I0x({
            tip: tip,
            type: type
        })
    }
    if(location.href.match('user')){
        let urlUserId=Number(location.href.match(/\d+$/g));
        let editArea=document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
        if(editArea && urlUserId==unsafeWindow.GUser.userId){
            //个人主页
            let btn=document.createElement('a')
            btn.id='cloudBtn'
            btn.className='u-btn2 u-btn2-1'
            let btni=document.createElement('i')
            btni.innerHTML='上传周杰伦'
            btn.appendChild(btni)
            btn.setAttribute("hidefocus","true");
            btn.style.marginRight='10px';
            btn.addEventListener('click',startUpload)
            editArea.insertBefore(btn,editArea.lastChild)
            let cloudDesc=document.createElement('b')
            cloudDesc.id='cloudDesc'
            cloudDesc.style.marginRight='10px';
            editArea.insertBefore(cloudDesc,btn)

            function startUpload(){
                let cloudDesc=document.getElementById('cloudDesc')
                let cloudBtn=document.getElementById('cloudBtn')
                cloudBtn.setAttribute("disabled","true");
                cloudDesc.innerHTML='正在获取配置...'
                //https://raw.githubusercontent.com/Cinvin/cdn/main/ncmJay.json
                //https://cdn.jsdelivr.net/gh/Cinvin/cdn@1.0.1/ncmJay.json
                fetch('https://cdn.jsdelivr.net/gh/Cinvin/cdn@1.0.1/ncmJay.json')
                    .then(r => r.json())
                    .then(r=>{
                    let songList=r.data
                    //console.log(songList)
                    let ids=songList.map(item=>{ return {'id':item.id} })
                    //获取需上传的song
                    cloudDesc.innerHTML='获取需要上传的歌曲...'
                    weapiRequest("/api/v3/song/detail", {
                        type: "json",
                        method: "post",
                        sync: true,
                        query: {c: JSON.stringify(ids)},
                        onload: function(content) {
                            //console.log(content)
                            let songs=Array()
                            let len=content.songs.length
                            for(let i =0;i<len;i++){
                                if(!content.privileges[i].cs){
                                    let config=songList.find(item=>{return item.id==content.songs[i].id})
                                    songs.push({
                                        id:content.songs[i].id,
                                        name:content.songs[i].name,
                                        album:content.songs[i].al.name,
                                        artists:content.songs[i].ar.map(ar=>ar.name).join(),
                                        filename:content.songs[i].name+'.'+config.ext,
                                        ext:config.ext,
                                        md5:config.md5,
                                        size:config.size,
                                    })
                                }
                            }

                            if ( songs.length == 0 ){
                                cloudDesc.innerHTML=''
                                showPopUp('没有需要上传的文件')
                                return
                            }
                            let md5UploadObj=new Md5Upload(songs,cloudDesc,onMD5Finnish)
                            md5UploadObj.start()
                        }
                    })
                })
            }
            function onMD5Finnish(md5UploadObj){
                let cloudBtn=document.getElementById('cloudBtn')
                let cloudDesc=document.getElementById('cloudDesc')
                cloudDesc.innerHTML=''
                cloudBtn.setAttribute("disabled","true");
                let text=`成功上传${md5UploadObj.sucessCount}首歌曲\n`
                if(md5UploadObj.failCount>0){
                    text+='以下歌曲上传失败:'
                    md5UploadObj.forEach(idx=>{text+=`${md5UploadObj.failList[idx].name} `})
                }
                showPopUp(text)
            }
            class Md5Upload {
                idx=0
                get currentIndex(){return this.idx}
                set currentIndex(currentIndex){
                    if(this.idx==currentIndex) return
                    this.idx=currentIndex
                    if(currentIndex<this.count){
                        if(this.textDOM){
                            this.textDOM.innerHTML=`上传${this.songs[currentIndex].name}中 总计:${this.count} 成功${this.sucessCount} 失败${this.failCount}`
                        }
                    }
                    else{
                        this.finnishCallback(this)
                    }
                }
                constructor(songs,textDOM,finnishCallback) {
                    this.songs=songs;
                    this.textDOM=textDOM;
                    this.count=songs.length
                    this.failCount=0
                    this.failList=Array()
                    this.sucessCount=0
                    this.finnishCallback=finnishCallback
                };
                start(){
                    this.currentIndex=0
                    this.uploadSong()
                }
                uploadSong(){
                    if(this.currentIndex>= this.count) return
                    let song=this.songs[this.currentIndex]
                    try{
                        weapiRequest("/api/cloud/upload/check", {
                            method: "POST",
                            type: "json",
                            data:{
                                songId:song.id,
                                md5:song.md5,
                                length:song.size,
                                ext:song.ext,
                                version:1,
                                bitrate:128,
                            },
                            onload: (res1)=>{
                                if(res1.code!=200){
                                    console.error(song.name,'1.检查资源',res1)
                                    this.onUploadFail()
                                    return
                                }
                                console.log(song.name,'1.检查资源',res1)
                                //step2 上传令牌
                                weapiRequest("/api/nos/token/alloc", {
                                    method: "POST",
                                    type: "json",
                                    query: {
                                        filename: song.filename,
                                        length:song.size,
                                        ext: song.ext,
                                        type: 'audio',
                                        bucket: 'jd-musicrep-privatecloud-audio-public',
                                        local: false,
                                        nos_product: 3,
                                        md5: song.md5
                                    },
                                    onload: (res2)=>{
                                        if(res2.code!=200){
                                            console.error(song.name,'2.获取令牌',res2)
                                            this.onUploadFail()
                                            return
                                        }
                                        console.log(song.name,'2.获取令牌',res2)
                                        //step3 提交
                                        weapiRequest("/api/upload/cloud/info/v2", {
                                            method: "POST",
                                            type: "json",
                                            data: {
                                                md5: song.md5,
                                                songid: res1.songId,
                                                filename: song.filename,
                                                song: song.name,
                                                album: song.album,
                                                artist: song.artists,
                                                bitrate: '128',
                                                resourceId: res2.result.resourceId,
                                            },
                                            onload: (res3)=>{
                                                if(res3.code!=200){
                                                    console.error(song.name,'3.提交文件',res3)
                                                    this.onUploadFail()
                                                    return
                                                }
                                                console.log(song.name,'3.提交文件',res3)
                                                //step4 发布
                                                weapiRequest("/api/cloud/pub/v2", {
                                                    cookie:true,
                                                    method: "POST",
                                                    type: "json",
                                                    data: {
                                                        songid: res3.songId,
                                                    },
                                                    onload: (res4)=>{
                                                        if(res4.code!=200 && res4.code!=201){
                                                            console.error(song.name,'4.发布资源',res4)
                                                            this.onUploadFail()
                                                            return
                                                        }
                                                        console.log(song.name,'4.发布资源',res4)
                                                        //step5 关联
                                                        if(res4.privateCloud.songId!=song.id){
                                                            weapiRequest("/api/cloud/user/song/match", {
                                                                method: "POST",
                                                                type: "json",
                                                                sync:true,
                                                                data: {
                                                                    songId: res4.privateCloud.songId,
                                                                    adjustSongId: song.id,
                                                                },
                                                                onload: (res5)=>{
                                                                    if(res5.code!=200){
                                                                        console.error(song.name,'5.匹配歌曲',res5)
                                                                        this.onUploadFail()
                                                                        return
                                                                    }
                                                                    console.log(song.name,'5.匹配歌曲',res5)
                                                                    console.log(song.name,'完成')
                                                                    //完成
                                                                    this.onUploadSucess()
                                                                },
                                                                onerror: function(res) {
                                                                    console.error(song.name,'5.匹配歌曲',res)
                                                                    this. onUploadFail()
                                                                }
                                                            })
                                                        }
                                                        else{
                                                            console.log(song.name,'完成')
                                                            //完成
                                                            this.onUploadSucess()
                                                        }
                                                    },
                                                    onerror: function(res) {
                                                        console.error(song.name,'4.发布资源',res)
                                                        this.onUploadFail()
                                                    }
                                                })
                                            },
                                            onerror: function(res) {
                                                console.error(song.name,'3.提交文件',res)
                                                this.onUploadFail()
                                            }
                                        });
                                    },
                                    onerror: function(res) {
                                        console.error(song.name,'2.获取令牌',res)
                                        this.onUploadFail()
                                    }
                                });
                            },
                            onerror: function(res) {
                                console.error(song.name,'1.检查资源',res)
                                this.onUploadFail()
                            }
                        })

                    }
                    catch(e){
                        console.error(e);
                        this.onUploadFail()
                    }
                }
                onUploadFail(){
                    this.failCount+=1
                    this.failList.push(this.currentIndex)
                    let song=this.songs[this.currentIndex]
                    showTips(`上传${song.name} - ${song.artists} - ${song.album}失败`,2)
                    this.currentIndex+=1
                    this.uploadSong()

                }
                onUploadSucess(){
                    this.sucessCount+=1
                    let song=this.songs[this.currentIndex]
                    showTips(`上传${song.name} - ${song.artists} - ${song.album}成功`,1)
                    this.currentIndex+=1
                    this.uploadSong()
                }

            }
        }
    }
})();
