﻿(function(window,undefined){'use strict';var AudioPlayer=(function(){var docTitle=document.title,player=document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index=0,playList,volumeBar,wheelVolumeValue=0,volumeLength,repeating=!1,seeking=!1,rightClick=!1,apActive=!1,pl,plUl,plLi,tplList='<li class="pl-list" data-track="{count}">'+'<div class="pl-list__track">'+'<div class="pl-list__icon"></div>'+'<div class="pl-list__eq">'+'<div class="eq">'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'<div class="eq__bar"></div>'+'</div>'+'</div>'+'</div>'+'<div class="pl-list__title">{title}</div>'+'</li>',settings={volume:.7,changeDocTitle:!0,confirmClose:!0,autoPlay:!1,buffered:!0,notification:!0,playList:[]};function init(options){if(!('classList' in document.documentElement)){return!1}if(apActive||player===null){return'Player already init'}settings=extend(settings,options);playBtn=player.querySelector('.ap__controls--toggle');playSvg=playBtn.querySelector('.icon-play');playSvgPath=playSvg.querySelector('path');prevBtn=player.querySelector('.ap__controls--prev');nextBtn=player.querySelector('.ap__controls--next');repeatBtn=player.querySelector('.ap__controls--repeat');volumeBtn=player.querySelector('.volume-btn');plBtn=player.querySelector('.ap__controls--playlist');curTime=player.querySelector('.track__time--current');durTime=player.querySelector('.track__time--duration');trackTitle=player.querySelector('.track__title');progressBar=player.querySelector('.progress__bar');preloadBar=player.querySelector('.progress__preload');volumeBar=player.querySelector('.volume__bar');playList=settings.playList;playBtn.addEventListener('click',playToggle,!1);volumeBtn.addEventListener('click',volumeToggle,!1);repeatBtn.addEventListener('click',repeatToggle,!1);progressBar.closest('.progress-container').addEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').addEventListener('mousemove',seek,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').addEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').addEventListener('mousemove',setVolume);volumeBar.closest('.volume').addEventListener(wheel(),setVolume,!1);document.documentElement.addEventListener('mouseup',seekingFalse,!1);prevBtn.addEventListener('click',prev,!1);nextBtn.addEventListener('click',next,!1);apActive=!0;renderPL();plBtn.addEventListener('click',plToggle,!1);audio=new Audio();audio.volume=settings.volume;audio.preload='none';audio.addEventListener('error',errorHandler,!1);audio.addEventListener('timeupdate',timeUpdate,!1);audio.addEventListener('ended',doEnd,!1);volumeBar.style.height=audio.volume*100+'%';volumeLength=volumeBar.css('height');if(settings.confirmClose)if(isEmptyList()){return!1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;if(settings.autoPlay){audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}}function changeDocumentTitle(title){if(settings.changeDocTitle){if(title){document.title=title}else{document.title=docTitle}}}function beforeUnload(evt){if(!audio.paused){var message='Music still playing';evt.returnValue=message;return message}}function errorHandler(evt){if(isEmptyList()){return}var mediaError={'1':'MEDIA_ERR_ABORTED','2':'MEDIA_ERR_NETWORK','3':'MEDIA_ERR_DECODE','4':'MEDIA_ERR_SRC_NOT_SUPPORTED'};audio.pause();curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));plLi[index]&&plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: '+mediaError[evt.target.error.code])}function updatePL(addList){if(!apActive){return'Player is not yet initialized'}if(!Array.isArray(addList)){return}if(addList.length===0){return}var count=playList.length;var html=[];playList.push.apply(playList,addList);addList.forEach(function(item){html.push(tplList.replace('{count}',count++).replace('{title}',item.title))});if(plUl.querySelector('.pl-list--empty')){plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title}plUl.insertAdjacentHTML('beforeEnd',html.join(''));plLi=pl.querySelectorAll('li')}function renderPL(){var html=[];playList.forEach(function(item,i){html.push(tplList.replace('{count}',i).replace('{title}',item.title))});pl=create('div',{'className':'pl-container','id':'pl','innerHTML':'<ul class="pl-ul">'+(!isEmptyList()?html.join(''):'<li class="pl-list--empty">PlayList is empty</li>')+'</ul>'});player.parentNode.insertBefore(pl,player.nextSibling);plUl=pl.querySelector('.pl-ul');plLi=plUl.querySelectorAll('li');pl.addEventListener('click',listHandler,!1)}function listHandler(evt){evt.preventDefault();if(evt.target.matches('.pl-list__title')||evt.target.matches('.pl-list__track')||evt.target.matches('.pl-list__icon')||evt.target.matches('.pl-list__eq')||evt.target.matches('.eq')){var current=parseInt(evt.target.closest('.pl-list').getAttribute('data-track'),10);if(index!==current){index=current;play(current)}else{playToggle()}}else{if(!!evt.target.closest('.pl-list__remove')){var parentEl=evt.target.closest('.pl-list');var isDel=parseInt(parentEl.getAttribute('data-track'),10);playList.splice(isDel,1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi=pl.querySelectorAll('li');[].forEach.call(plLi,function(el,i){el.setAttribute('data-track',i)});if(!audio.paused){if(isDel===index){play(index)}}else{if(isEmptyList()){clearAll()}else{if(isDel===index){if(isDel>playList.length-1){index-=1}audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;progressBar.style.width=0}}}if(isDel<index){index--}}}}function plActive(){if(audio.paused){plLi[index].classList.remove('pl-list--current');return}var current=index;for(var i=0,len=plLi.length;len>i;i++){plLi[i].classList.remove('pl-list--current')}plLi[current].classList.add('pl-list--current')}function play(currentIndex){if(isEmptyList()){return clearAll()}index=(currentIndex+playList.length)%playList.length;audio.src=playList[index].file;trackTitle.innerHTML=playList[index].title;changeDocumentTitle(playList[index].title);audio.play();notify(playList[index].title,{icon:playList[index].icon,body:'Now playing',tag:'music-player'});playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'));plActive()}function prev(){play(index-1)}function next(){play(index+1)}function isEmptyList(){return playList.length===0}function clearAll(){audio.pause();audio.src='';trackTitle.innerHTML='queue is empty';curTime.innerHTML='--';durTime.innerHTML='--';progressBar.style.width=0;preloadBar.style.width=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));if(!plUl.querySelector('.pl-list--empty')){plUl.innerHTML='<li class="pl-list--empty">PlayList is empty</li>'}changeDocumentTitle()}function playToggle(){if(isEmptyList()){return}if(audio.paused){if(audio.currentTime===0){notify(playList[index].title,{icon:playList[index].icon,body:'Now playing'})}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-pause'))}else{changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'))}plActive()}function volumeToggle(){if(audio.muted){if(parseInt(volumeLength,10)===0){volumeBar.style.height=settings.volume*100+'%';audio.volume=settings.volume}else{volumeBar.style.height=volumeLength}audio.muted=!1;volumeBtn.classList.remove('has-muted')}else{audio.muted=!0;volumeBar.style.height=0;volumeBtn.classList.add('has-muted')}}function repeatToggle(){if(repeatBtn.classList.contains('is-active')){repeating=!1;repeatBtn.classList.remove('is-active')}else{repeating=!0;repeatBtn.classList.add('is-active')}}function plToggle(){plBtn.classList.toggle('is-active');pl.classList.toggle('h-show')}function timeUpdate(){if(audio.readyState===0)return;var barlength=Math.round(audio.currentTime*(100/audio.duration));progressBar.style.width=barlength+'%';var curMins=Math.floor(audio.currentTime/60),curSecs=Math.floor(audio.currentTime-curMins*60),mins=Math.floor(audio.duration/60),secs=Math.floor(audio.duration-mins*60);(curSecs<10)&&(curSecs='0'+curSecs);(secs<10)&&(secs='0'+secs);curTime.innerHTML=curMins+':'+curSecs;durTime.innerHTML=mins+':'+secs;if(settings.buffered){var buffered=audio.buffered;if(buffered.length){var loaded=Math.round(100*buffered.end(0)/audio.duration);preloadBar.style.width=loaded+'%'}}}function shuffle(){if(shuffle){index=Math.round(Math.random()*playList.length)}}function doEnd(){if(index===playList.length-1){if(!repeating){audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));return}else{play(0)}}else{play(index+1)}}function moveBar(evt,el,dir){var value;if(dir==='horizontal'){value=Math.round(((evt.clientX-el.offset().left)+window.pageXOffset)*100/el.parentNode.offsetWidth);el.style.width=value+'%';return value}else{if(evt.type===wheel()){value=parseInt(volumeLength,10);var delta=evt.deltaY||evt.detail||-evt.wheelDelta;value=(delta>0)?value-10:value+10}else{var offset=(el.offset().top+el.offsetHeight)-window.pageYOffset;value=Math.round((offset-evt.clientY))}if(value>100)value=wheelVolumeValue=100;if(value<0)value=wheelVolumeValue=0;volumeBar.style.height=value+'%';return value}}function handlerBar(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;seek(evt)}function handlerVol(evt){rightClick=(evt.which===3)?!0:!1;seeking=!0;setVolume(evt)}function seek(evt){if(seeking&&rightClick===!1&&audio.readyState!==0){var value=moveBar(evt,progressBar,'horizontal');audio.currentTime=audio.duration*(value/100)}}function seekingFalse(){seeking=!1}function setVolume(evt){evt.preventDefault();volumeLength=volumeBar.css('height');if(seeking&&rightClick===!1||evt.type===wheel()){var value=moveBar(evt,volumeBar.parentNode,'vertical')/100;if(value<=0){audio.volume=0;audio.muted=!0;volumeBtn.classList.add('has-muted')}else{if(audio.muted)audio.muted=!1;audio.volume=value;volumeBtn.classList.remove('has-muted')}}}function notify(title,attr){if(!settings.notification){return}if(window.Notification===undefined){return}attr.tag='AP music player';window.Notification.requestPermission(function(access){if(access==='granted'){var notice=new Notification(title.substr(0,110),attr);setTimeout(notice.close.bind(notice),5000)}})}function destroy(){if(!apActive)return;if(settings.confirmClose){window.removeEventListener('beforeunload',beforeUnload,!1)}playBtn.removeEventListener('click',playToggle,!1);volumeBtn.removeEventListener('click',volumeToggle,!1);repeatBtn.removeEventListener('click',repeatToggle,!1);plBtn.removeEventListener('click',plToggle,!1);progressBar.closest('.progress-container').removeEventListener('mousedown',handlerBar,!1);progressBar.closest('.progress-container').removeEventListener('mousemove',seek,!1);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);volumeBar.closest('.volume').removeEventListener('mousedown',handlerVol,!1);volumeBar.closest('.volume').removeEventListener('mousemove',setVolume);volumeBar.closest('.volume').removeEventListener(wheel(),setVolume);document.documentElement.removeEventListener('mouseup',seekingFalse,!1);prevBtn.removeEventListener('click',prev,!1);nextBtn.removeEventListener('click',next,!1);audio.removeEventListener('error',errorHandler,!1);audio.removeEventListener('timeupdate',timeUpdate,!1);audio.removeEventListener('ended',doEnd,!1);pl.removeEventListener('click',listHandler,!1);pl.parentNode.removeChild(pl);audio.pause();apActive=!1;index=0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d',playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active')}function wheel(){var wheel;if('onwheel' in document){wheel='wheel'}else if('onmousewheel' in document){wheel='mousewheel'}else{wheel='MozMousePixelScroll'}return wheel}function extend(defaults,options){for(var name in options){if(defaults.hasOwnProperty(name)){defaults[name]=options[name]}}return defaults}function create(el,attr){var element=document.createElement(el);if(attr){for(var name in attr){if(element[name]!==undefined){element[name]=attr[name]}}}return element}function getTrack(index){return playList[index]}Element.prototype.offset=function(){var el=this.getBoundingClientRect(),scrollLeft=window.pageXOffset||document.documentElement.scrollLeft,scrollTop=window.pageYOffset||document.documentElement.scrollTop;return{top:el.top+scrollTop,left:el.left+scrollLeft}};Element.prototype.css=function(attr){if(typeof attr==='string'){return getComputedStyle(this,'')[attr]}else if(typeof attr==='object'){for(var name in attr){if(this.style[name]!==undefined){this.style[name]=attr[name]}}}};window.Element&&function(ElementPrototype){ElementPrototype.matches=ElementPrototype.matches||ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.msMatchesSelector||function(selector){var node=this,nodes=(node.parentNode||node.document).querySelectorAll(selector),i=-1;while(nodes[++i]&&nodes[i]!=node);return!!nodes[i]}}(Element.prototype);window.Element&&function(ElementPrototype){ElementPrototype.closest=ElementPrototype.closest||function(selector){var el=this;while(el.matches&&!el.matches(selector))el=el.parentNode;return el.matches?el:null}}(Element.prototype);return{init:init,update:updatePL,destroy:destroy,getTrack:getTrack}})();window.AP=AudioPlayer})(window)
// TEST: image for web notifications
var iconImage = '';
AP.init({
  playList: [
    {'icon': iconImage, 'title': 'BTS - Boy With Luv', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LoMRrykfx-UNr5Pqv9e%2F-LoMS6ZIFJftWQcifKJb%2Fboywithluv.mp3?alt=media&token=762ce398-7ba1-4ba9-95e6-47303ccbd2ea'},
    {'icon': iconImage, 'title': 'Blackpink - Kill This Love', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LfM5t_UzFDhC0r657KE%2F-LfM6h-A1p2nrrxMqih5%2Fkillthis.mp3?alt=media&token=69155fb9-f997-40eb-b20f-4de913f27636'},
    {'icon': iconImage, 'title': 'TWICE - Feel Special', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAqLF5H04nnDNnTcu3%2Ffeelspecial.mp3?alt=media&token=4480725d-844b-4068-9a0a-1cad93eb4b9a'},
    {'icon': iconImage, 'title': 'Somi - BIRTHDAY', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAlY-xJBBvJDQybCyd%2Fbirthday.mp3?alt=media&token=99b99dc0-d7b8-4b6d-8cc9-9966c7f82661'},
    {'icon': iconImage, 'title': 'Seventeen - Fear', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAq3iBS0PG92KSTkqF%2Ffear.mp3?alt=media&token=dcdebf2c-ac49-4a51-907e-ae22b635184a'},
    {'icon': iconImage, 'title': 'BTS - FAKE LOVE', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAn3X3dUFywzfz0CEy%2Fbts-fake-love.mp3?alt=media&token=8300016c-d5b6-48a7-b169-6d77d188036f'},
    {'icon': iconImage, 'title': 'Everglow - Bon Bon Chocolat', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAm4WI_p4n_B9x3qAQ%2Fbonbonchocolat.mp3?alt=media&token=ac77e2e0-455a-4758-96b2-9bd3c7191a05'},
    {'icon': iconImage, 'title': 'BLACKPINK - Don't Know What To Do', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAnxNKej9kGthIpkx8%2Fdontknow.mp3?alt=media&token=8e597d1b-c054-4778-aea4-bc854491b107'},
    {'icon': iconImage, 'title': 'Exo - Love Shot', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAsrfxX9Xn_QI7TFFK%2Floveshot.mp3?alt=media&token=5f17e6b6-7c1a-4843-a319-45d5bf858398'},
    {'icon': iconImage, 'title': 'Stray Kids- MIROH', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAuIFdYPtQ51bVVYNs%2Fmiroh.mp3?alt=media&token=691766f6-b958-418c-9d06-4b49b3ffe004'},
    {'icon': iconImage, 'title': 'Chung Ha - Snapping', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAwLJYdNCpGeVc9FB7%2Fsnapping.mp3?alt=media&token=7d44feb1-d8ed-4f20-bba9-a4a43d4e74f2'},
    {'icon': iconImage, 'title': 'BTS - Lights', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAs15OZbFtr92awIe8%2Flights.mp3?alt=media&token=29ee8b71-b574-42e9-8a46-528b592370a6'},
    {'icon': iconImage, 'title': '(G)I-DLE - Uh-Oh', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAx4cAD30aHz0DsdSY%2Fuhoh.mp3?alt=media&token=515e48ac-a9b5-46a5-87a9-5a05840429ed'},
    {'icon': iconImage, 'title': 'Itzy - (DALLA DALLA)', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAnZjfdXOF7WkExsAf%2Fdalladalla.mp3?alt=media&token=45abb2cf-5d4e-4ff5-90a9-30660c5acb30'},
    {'icon': iconImage, 'title': 'LEE HI ft. B.I of iKON - NO ONE', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAujSFMzm7hCEj_HgI%2Fnoone.mp3?alt=media&token=4595f137-3c85-4648-88bc-1e3d0cfd2a51'},
    {'icon': iconImage, 'title': 'Jennie - SOLO', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAwkYlreWmHEtvBC-q%2Fsolo.mp3?alt=media&token=85bb1de5-9a8f-48f6-a5a2-4792485c7235'},
    {'icon': iconImage, 'title': 'EXO-SC - What a life', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAy75KyYqhuganoe7a%2Fwhatalife.mp3?alt=media&token=ce434a0e-5de0-4c79-a2c3-e06459a35ca4'},
    {'icon': iconImage, 'title': 'Seventeen - HIT', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqArJq4BPLthWnOSDUH%2Fhit.mp3?alt=media&token=b98ae0c0-087e-459b-9ec8-36ee8629baeb'},
    {'icon': iconImage, 'title': 'TWICE - What is Love?', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAyTbIuYk25uCKQN3-%2Fwhatislove.mp3?alt=media&token=31d77c01-c8bb-493b-86c5-c0c40f9ddb9a'},
    {'icon': iconImage, 'title': 'NCT Dream - BOOM', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqB1gSdiUwDNyuFAEBx%2F-LqB1juAEZjt6Sv3EjRy%2Fboom.mp3?alt=media&token=063352d3-2994-4b6a-8c53-ebe5b76ae51b'},
    {'icon': iconImage, 'title': 'BTS - Heartbeat', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAqlQoGSokfGmKLJhV%2Fheartbeat.mp3?alt=media&token=f176259c-0d4f-48cb-9c64-35597670e1ef'},
    {'icon': iconImage, 'title': 'Red Velvet - Bad Boy', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAl1QwFslY0eQwBJfT%2Fbadboy.mp3?alt=media&token=1ce5feb2-d8ae-40eb-9b4a-d1786b610368'},
    {'icon': iconImage, 'title': 'TWICE - FANCY', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqApdzz2shMQap89aAj%2Ffancy.mp3?alt=media&token=57000a20-b583-4527-9704-5145c5a1af9e'},
    {'icon': iconImage, 'title': 'WINNER - AH YEAH', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAkZsGnZhMQaqMid5p%2Fahyeah.mp3?alt=media&token=2319663d-e2be-44ce-b47a-c945b74ae1e8'},
    {'icon': iconImage, 'title': 'EXID - Me & You', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAtOwyxGGwCwnkw9HX%2Fmeyou.mp3?alt=media&token=d45dc796-7383-4ec8-a44e-7b4412d912d1'},
    {'icon': iconImage, 'title': 'GOT7 - ECLIPSE', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAp4ogMOKm7FdoyaTJ%2Feclipse.mp3?alt=media&token=7da4e021-7f17-4ac4-8127-42839d9c2e70'},
    {'icon': iconImage, 'title': 'Weki Meki - Picky Picky', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAxPq0GTvbbvRincoX%2Fwekimeki.mp3?alt=media&token=e7c81f26-65ae-45ab-ae4b-c35911d4a703'},
    {'icon': iconImage, 'title': 'iKON - LOVE SCENARIO', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAsW9vNDQxZyiJDiHf%2Flovescenario.mp3?alt=media&token=0d7f4cf1-ea11-4657-9d0c-b19d95c0d4cb'},
    {'icon': iconImage, 'title': 'AB6IX - BREATHE', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAmaiypbiEDphdDmd3%2Fbreathe.mp3?alt=media&token=992a55e0-1ae0-4f5c-9fe2-352d509e479d'},
    {'icon': iconImage, 'title': 'BVNDIT - Dramatic', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAoX14c9m8B9qLaH65%2Fdramatic.mp3?alt=media&token=8b0b14c4-130d-4cea-afe5-d19f219d3ce0'},
    {'icon': iconImage, 'title': 'TWICE - YES or YES', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAypUYSeDzcPr64I9s%2Fyesoryes.mp3?alt=media&token=540f2849-4fa8-4dc8-817d-607d8a7ae2a1'},
    {'icon': iconImage, 'title': 'Red Velvet - RBB (Really Bad Boy)', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAv_kBc-DGwfjS-ZXY%2Frbb.mp3?alt=media&token=7a60b135-7aa3-4c9f-aaed-a8c7c23055dd'},
    {'icon': iconImage, 'title': 'EXID - I Love You', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAreSdGFVSklkOFuHc%2Filoveyou.mp3?alt=media&token=e76a2a98-26c8-4f18-bc6c-c06239f9678a'},
    {'icon': iconImage, 'title': 'Ateez - Say My Name', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAvyQXqJ6ihBaMoUCw%2Fsaymyname.mp3?alt=media&token=aa851cc3-380c-4048-baf1-cfe2d8d8351e'},
    {'icon': iconImage, 'title': 'WANNA ONE - Spring Breeze', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-Lpdr52D2axjjm7pA8Aa%2F-LqAkUMlD7SHj6XcOhSA%2F-LqAv3j-amzwQLz-1CFq%2Fonespringbreeze.mp3?alt=media&token=e392395d-ae7f-4755-84ed-4a57de885877'},
    {'icon': iconImage, 'title': 'Dua Lipa & BLACKPINK - Kiss and Make Up', 'file': 'https://firebasestorage.googleapis.com/v0/b/gitbook-28427.appspot.com/o/assets%2F-LN6pmp-hlaXw_W0OEcN%2F-LP_vPaJKB7qqXiTCUZ8%2F-LP_vTHVyHV3cnfxDXca%2Fkissanmake.mp3?alt=media&token=6bfb2336-0128-4370-a879-fbe85735cdb5'},
  ]
});

$(document).ready(function(){
  $(".pl-list__download").on("click", function(){
    var trackPlaying = $(this).closest(".pl-list");
    console.log(AP.getTrack(trackPlaying.attr("data-track")));
  });
});