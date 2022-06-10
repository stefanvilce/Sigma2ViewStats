const util = {
    alerting () {
        console.log("Test function");
    },
    
    diffTime(dt) {
        //measuring the time since the CACHE file was created
        var dt1 = new Date(dt);
        var dt2 = new Date();
        var diff = (dt2.getTime() - dt1.getTime())/1000;
        console.log(" // dt2 = " + dt2.getTime());
        console.log(" // dt1 = " + dt1.getTime());
        diff /= 60; console.log("Diferenta este de ___ " + diff);
        diff = Math.round(diff); 
        if(diff > 1440){ //if the cache is older than 1440 minutes (24 hours) then we have to replace the CACHE file.
            return false; // the CACHE is too old; so we don't keep it anymore;
        } else {
            return true; // the CACHE is too young; so it still can be used
        }
    }
}

export default util