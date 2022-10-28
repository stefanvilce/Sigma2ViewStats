const Util = {
   
    linkAPI: () => "https://search-api.web.sigma2.no/norstore-archive/metadata/api/basic-search?query=*",
    
    diffTime(dt) {
        //measuring the time since the CACHE file was created
        var dt1 = new Date(dt);
        var dt2 = new Date();
        var diff = (dt2.getTime() - dt1.getTime())/1000;
        diff /= 60;
        diff = Math.round(diff); 
        if(diff > 1440){ //if the cache is older than 1440 minutes (24 hours) then we have to replace the CACHE file.
            return false; // the CACHE is too old; so we don't keep it anymore;
        } else {
            return true; // the CACHE is too young; so it still can be used
        }
    }

}

export default Util