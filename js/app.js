$(document).ready(function() {
    $("#btn-calculate").on('click', function(e) {
        five_thousand_and_twelve_meteos();
    });
});

var global_details = "";
var meteo_data = [];

var five_thousand_and_twelve_meteos = function(hp) {
    
    global_details = "";
    
    var hp = hp || parseInt($("#num-hp").val());
    
    var min = 9999;
    var max = 0;
    var avg = 0;
    
    var survived = 0;
    
    for (var i=0; i<256; i++) {
        var dmg = meteo((i & 3) >> 1, i);
        avg += dmg;
		if (dmg < min) min = dmg;
		if (dmg > max) max = dmg;
		if (dmg < hp) survived++;
    };
	avg = avg / 256;
    
    $("#lbl-avg").html(avg.toString());
    $("#lbl-min").html(min.toString());
    $("#lbl-max").html(max.toString());
    $("#lbl-survival").html(survived.toString() + "/256");
    $("#result-survival").html((survived / 2.56) + "%");
    $("#lbl-details").html(global_details);
    return parseFloat(survived / 256);
    
};

var meteo = function(RT, RP) {
    
    // Ahriman's Meteo data
    var hits = 0x0e;
    var attack = 0x42;
    var power = 0xb4;
    
    // get Devout data
    var avoidance = parseInt($("#num-mavoid").val());
    var evade = parseInt($("#num-mevade").val());
    var defense = parseInt($("#num-mdef").val());
    
    global_details += "DEF "+defense;
    
    // set RNG
    FF3js.setRngTable(RT);
    FF3js.setRngStep(RP);
    
    // first RNG value - dummy (unused in boss fights)
    FF3js.addRngStep(1);
    
    // get turn order
    var turn_order = FF3js.getTurnOrder([35, 19, 17, 6]);
    
    // simulate the turn until it is ahriman's turn
    var t_count = 0;
    var attacker;
    do {
        attacker = turn_order[t_count];
        
        // Main Lv 38+ Devout
        if (attacker == 0) {
            var safe_hits = FF3js.getHitCount(7, 75 + ((54 + 10) >> 1));
            var safe_power = FF3js.damageRange(5);
            defense = defense + (safe_power*safe_hits);
            global_details += "+(A)"+(safe_power*safe_hits);
            
        // Secondary Lv 30 Devout/White.Wiz
        } else if (attacker == 1) {
            var safe_hits = FF3js.getHitCount(4, 75 + (30 >> 1));
            var safe_power = FF3js.damageRange(5);
            defense = defense + (safe_power*safe_hits);
            global_details += "+(B)"+(safe_power*safe_hits);
            
        // Tertiary low lvl Knight (using Defender)
        } else if (attacker == 2) {
            var safe_power = FF3js.damageRange(5);
            defense = defense + safe_power;
            global_details += "+(C)"+safe_power;
            
        // Onion Kid
        } else if (attacker == 3) {
            global_details += "+(D)";
        };
        t_count++;
        
    } while (attacker != 128);
    
    if (defense > 255) defense = 255;
    
    // calculate number of hits
    var num_hits = hits - FF3js.getHitCount(avoidance, evade);
    
    // meteo power
    var meteo_power = FF3js.damageRange((attack >> 1) + power);
    
    // putting it all together...
    var damage = (meteo_power - defense);
    if (damage < 0) damage = 0;
    damage *= num_hits;
    if (damage == 0) damage = 1;
    
    global_details += " damage:"+damage+"<br/>";
    return (damage);
    
};