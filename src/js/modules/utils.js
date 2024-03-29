import gsap from 'gsap';
import { 
    circles, 
    selectRegion, 
    filterOptions, 
    filterButton, 
    loadingState,
    loadedCountries, 
    countriesContainer,
    assetsCount
} from './dom-variables';

export function getIMG(countries){

    return new Promise(resolve=>{

        (function() {
            var cors_api_host = 'falldstudio-restcountries.herokuapp.com';
            var cors_api_url = 'https://' + cors_api_host + '/';
            var slice = [].slice;
            var origin = window.location.protocol + '//' + window.location.host;
            var open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function() {
                var args = slice.call(arguments);
                var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
                if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
                    targetOrigin[1] !== cors_api_host) {
                    args[1] = cors_api_url + args[1];
                }
                return open.apply(this, args);
            };
        })();

        loadingState.innerText = 'Loading assets...';
        assetsCount.querySelector('span:nth-child(1)').innerText = 0; 
        assetsCount.querySelector('span:nth-child(2)').innerText = '%'; 
  
        function get(index){

            return new Promise(success=>{

                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', countries[index].flags.png)
                    xhr.addEventListener('readystatechange', function(){

                        if(this.readyState === 4 && this.status === 200){

                            let img = new Image();
                            let src = URL.createObjectURL(this.response);
                            img.src = src;
                            success(img);
                        }
                        
                    });
                    xhr.responseType = "blob";
                    xhr.send();

              
            });
        };

        let promises = [];
        let loadedAssets = 0;

        for(let i = 0 ; i < countries.length ; i++){
            promises.push(get(i));
            promises[i]
            .then(()=>{
                loadedAssets++;
                assetsCount.querySelector('span:nth-child(1)').innerText = Math.round(100 * loadedAssets / countries.length); 
            })
        }
        
        Promise.all(promises)
        .then(v=>{
            resolve(v);
        });
    });
};

const dark = [
    '#0018A8',
    '#000066',
    '#006233',
    '#000000',
    '#01411C',
    '#8D1B3D',
    '#9E3039'
];

const medium = [
    '#E41E20',
    '#009B3A',
    '#00AFCA',
    '#00966E',
    '#FF4E12'
];

const light = [
    '#FEDF00',
    '#3A7DCE',
    '#00ABC9',
    '#F77F00',
    '#FF0000'
];

const eventHandler = function(){
    loadingColorSwap.swap(this);
};

export const loadingColorSwap = {

    swap : function(elt){

        let ref;

        if(elt.getAttribute('data-index') === '1'){
            ref = dark;
        }else if(elt.getAttribute('data-index') === '2'){
            ref = light;
        }else{
            ref = medium;
        }

        let tempColor = ref.filter(c=>{return c !== elt.getAttribute('data-color')});
        let nbr = Math.round(Math.random() * (tempColor.length - 1));
        elt.style.fill = tempColor[nbr];
        elt.setAttribute('data-color',tempColor[nbr]);
    },

    start : function(){
    
        circles.forEach(c=>{
            this.swap(c);
            c.addEventListener('animationiteration', eventHandler);
        });
    },

    stop : function(){

        circles.forEach(c=>{
            c.removeEventListener('animationiteration', eventHandler);
        });
    }
    
};

export const setRegionMenu = {

    auto : function(){
        if(filterOptions.getAttribute('data-state') === 'closed') setRegionMenu.open();
        else if(filterOptions.getAttribute('data-state') === 'opened') setRegionMenu.close();
    },

    open : function(){
        filterOptions.style.pointerEvents = 'all';
        filterButton.querySelector('.arrow-svg').classList.add('reverse');
        filterOptions.setAttribute('data-state','opened');

        gsap.to(filterOptions.firstElementChild,{
            y : 0,
            duration : 0.5,
            ease : 'power3.out'
        });
    },

    close : function(){
        filterOptions.style.removeProperty('pointer-events');
        filterButton.querySelector('.arrow-svg').classList.remove('reverse');
        filterOptions.setAttribute('data-state','closed');

        gsap.to(filterOptions.firstElementChild,{
            y : -filterOptions.offsetHeight,
            duration : 0.3,
            ease : 'power3.out'         
        });
    }
};

export const setSelectedRegion = function(elt){

    selectRegion.querySelector('[selected]').selected = false;
    selectRegion.querySelector(`[value="${elt.getAttribute('data-value')}"]`).selected = true;
    if(selectRegion.selectedIndex === 0) filterButton.querySelector('span').innerText = 'Filter by Region';
    else filterButton.querySelector('span').innerText = selectRegion.options[selectRegion.selectedIndex].innerText;

};

export const resizeCountriesElt = function(elt){

    console.log(countriesContainer.firstElementChild)

    let ref = countriesContainer.firstElementChild.offsetWidth, arr;

    if(typeof elt === 'array') arr = elt;
    else arr = Array.from(loadedCountries);

    arr.forEach(c=>{

        if(c.offsetWidth > ref){
            c.style.maxWidth = ref + 'px';
        }else{
            c.style.removeProperty('max-width');
        }
    });
};

export const spaceNumber = function(number){

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

};

export const CookieManager = function(){
      
    this.get = function(name){

        let i = 0, found = false, value = undefined;
        
        if(document.cookie !== ''){

            let cookies = document.cookie.split(';');
            while(i < cookies.length && !found){
                let arr = cookies[i].split('=');
                if(arr[0].trim() === name.trim()){
                    found = true;
                    if(arr.length === 1){
                        value = '';
                    }else if(arr[1] !== 'undefined'){
                        value = JSON.parse(arr[1]);
                    };
                }else i++
            };
        };

        return value;

    };

    this.setValue = function(name, value){

        document.cookie = `${name}=${value};`;

    };

    this.set = function({
        name,
        value,
        path,
        domain,
        maxAge,
        expires,
        secure,
        samesite
    }){
        let cookie = `${name}=${value};`;
        
        Object.keys(arguments[0]).slice(2).forEach(k=>{
            cookie += `${k.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`)}=${arguments[0][k]};`;
        });
        
        document.cookie = cookie;
    };
    
    this.delete = function(target){

        let result = true;

        if(Array.isArray(target) || typeof target === 'string'){

            if(typeof target === 'string') target = [target];

            target.forEach(c=>{

                if(this.isDefined(c)){
                    document.cookie = c + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
                }else if(result){
                    result = false;
                };

            });

        }else{
            result = false;
        };

        return result;
    };

    this.deleteAll = function(){
        
        let cookies = document.cookie.split(';');

        cookies.forEach(c=>{
            document.cookie = c.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        });
    };

    this.isDefined = function(name){
        if(typeof this.get(name) !== 'undefined') return true;
        return false;
    }
};