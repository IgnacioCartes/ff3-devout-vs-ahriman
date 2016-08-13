var FF3js = (function(window, $, module, undefined) {
    
    // RNG tables
    var rngT=[
        [1,4,13,40,121,147,69,208,113,171,2,7,22,67,202,95,225,164,18,55,166,12,37,112,174,11,34,103,201,92,234,191,62,187,50,151,57,172,5,16,49,148,66,199,86,252,245,224,161,27,82,247,230,179,26,79,238,203,98,216,137,99,213,128,126,132,114,168,6,19,58,175,14,43,130,120,150,60,181,32,97,219,146,72,217,140,90,240,209,116,162,24,73,220,149,63,190,59,178,23,70,211,122,144,78,235,194,71,214,131,117,159,33,100,210,119,153,51,154,48,145,75,226,167,9,28,85,255,254,251,242,215,134,108,186,47,142,84,253,248,233,188,53,160,30,91,237,200,89,243,218,143,81,244,221,152,54,163,21,64,193,68,205,104,198,83,250,239,206,107,189,56,169,3,10,31,94,228,173,8,25,76,229,176,17,52,157,39,118,156,42,127,129,123,141,87,249,236,197,80,241,212,125,135,105,195,74,223,158,36,109,183,38,115,165,15,46,139,93,231,182,35,106,192,65,196,77,232,185,44,133,111,177,20,61,184,41,124,138,96,222,155,45,136,102,204,101,207,110,180,29,88,246,227,170,0],
        [2,12,62,199,26,132,150,240,178,131,145,215,53,244,198,31,157,236,158,231,133,155,246,208,18,92,49,247,213,43,217,63,194,51,254,248,218,68,169,176,141,195,46,232,138,180,121,95,34,172,161,216,58,219,73,144,210,28,142,200,21,107,25,127,125,115,65,184,101,4,22,112,50,252,238,168,181,116,70,159,226,108,30,152,250,228,118,80,109,35,177,136,170,171,166,191,66,179,126,120,90,59,214,48,242,188,81,104,10,52,249,223,93,44,222,88,69,164,201,16,82,99,14,72,149,235,153,255,253,243,193,56,229,123,105,15,77,124,110,40,202,11,57,224,98,19,97,24,122,100,9,47,237,163,206,8,42,212,38,192,61,204,1,7,37,187,86,79,114,60,209,23,117,75,134,160,221,83,94,39,197,36,182,111,45,227,113,55,234,148,230,128,130,140,190,71,154,251,233,143,205,3,17,87,74,139,185,96,29,147,225,103,5,27,137,175,146,220,78,119,85,84,89,64,189,76,129,135,165,196,41,207,13,67,174,151,245,203,6,32,162,211,33,167,186,91,54,239,173,156,241,183,106,20,102,0]
    ];
    
    // Private variables
    var rng_table = 0;
    var rng_step = 0;
    
    // Core private methods
    var next_rand_max = function(min, max) {
        if (min == 255) return 255;
        if (max == 0) return 0;
        if (min == max) return max;
        var mult = (max - min) * ((rngT[rng_table][rng_step] << 8) + 128);
        rng_step = (rng_step + 1) % 256;
        return (mult >> 16) + ((mult & 0x8000)?1:0) + min;
    }
    
    var descending_sort = function(a, b) {
		if (a[0] < b[0]) return 1;
		if (a[0] > b[0]) return -1;
		// when both agility RNG values are the same, bottom has priority
		// except when all 4 have the same agility RNG values but that
		// should never happen
		// --- and if it happens the order is set as 2,3,0,1
		if (a[1] < b[1]) return 1;
		if (a[1] > b[1]) return -1;
		return 0;
    }
    
    
    // Public methods
    module.setRngTable = function(table) { rng_table = table; }
    module.setRngStep = function(step) { rng_step = step; }
    module.addRngStep = function(steps) { rng_step = (rng_step + steps) % 256; }
    module.damageRange = function(damage) { return damage + next_rand_max(0, damage >> 1); }
    module.getHitCount = function(n, chance) {
        var hits = 0;
        for(var i=0; i<n; i++) {
            if(next_rand_max(0, 100) < chance) hits++;
        }
        return (hits);
    }
    module.getTurnOrder = function(agi) {
        var order_table = [];
        for (var i=0; i<12; i++) {
            order_table.push([next_rand_max(0, 255), i]);
        }
        order_table.sort(descending_sort);
        var party_order = [];
        for (var i=0; i<4; i++) {
            party_order.push([next_rand_max(0, agi[i] << 1) + agi[i], i]);
        }
        party_order.sort(descending_sort);
        var turn_order = [];
        var party_count = 0;
        for (var i=0; i<12; i++) {
            var to_push = order_table[i][1];
            if(to_push == 0) turn_order.push(to_push + 128);
            if(to_push >= 8) {
                if(party_count < party_order.length) {
                    //if (party_order[party_count][1] == 0) party_count++;
                    if (party_count < party_order.length) turn_order.push(party_order[party_count][1]);
                    party_count++;
                }
            }
        }
        return(turn_order);
    }
    
    return module;
    
})(window, jQuery, FF3js || {});