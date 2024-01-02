upgradeAmt = 28
clicks = new Decimal (0)
totalClicks = new Decimal (0)
clickGain = new Decimal (1)
decimalClickBoost = new Decimal (1)
decUp = {
    up7: false,
    up9: false,
    up12: false,
    up16: false,
    up18: false,
    up19: false,
    up22: false,
    up25: false,
}

function loadData() {
    clicks = new Decimal(localStorage.getItem("clicks")) || new Decimal (0)
    totalClicks = clicks
    buyMax()
}

function saveData() {
    localStorage.setItem("clicks", totalClicks.toString())
}

function InitUps() {
    for (i = 2; i <= upgradeAmt; i++) {
        document.getElementById("Upgrade"+i).style.visibility = "collapse"
    }
}

window.onload = function() {
    InitUps()
    loadData()
    Loop()
}

function buyMax() {
    for (i = 1; i <= upgradeAmt; i++) {
        document.getElementById("Upgrade"+i).click()
    }
}

setInterval(saveData, 500)

function pow10(vall,tier = null) {
    let val = new Decimal('0');
    if (tier == null) {
        return new Decimal('10').pow(vall);
    } else if (tier < 0) {
        val = vall
        val.sign = 1;
        val.layer += tier;
        if (val.layer < 0) {
            val.layer = 0;
            val.mag = getBaseLog(10,vall.mag);
            val.sign = vall.sign;
        }
        return new Decimal(val.toString());
    } else {
        val.sign = 1;
        val.mag = getBaseLog(10,vall).toString();
        val.layer = tier+1;
        return new Decimal(val.toString());
    }
}

function getBaseLog(base, value) {
    const baseDecimal = new Decimal(base);
    const valueDecimal = new Decimal(value);
    const result = valueDecimal.log(baseDecimal);
    return result;
}

function RoundNum(Val) {
    const valDecimal = new Decimal(Val);
    return valDecimal.times(10).ceil()/10;
}

Abbreviations = ["k","M","B","T","Qd","Qn","Sx","Sp","Oc","No"];

function Format(Val) {
    const valDecimal = new Decimal(Val);
    if (valDecimal.gte(pow10(1e6,4))) {
        if (valDecimal.mag < 1000000) {
            return Format(new Decimal('10').pow(valDecimal.mag)) + "#" + Format(valDecimal.layer)
        } else {
          return Format(valDecimal.mag) + "#" + Format(valDecimal.layer+1)
        }
    } else if (valDecimal.gte('1e1000000')) {
        return "e" + Format(getBaseLog(10,valDecimal))
    } else if (valDecimal.gte('1e1000')) {
        const parts = valDecimal.toExponential(0).split('e');
        const coefficient = parts[0] === "10" ? "1" : parts[0];
        return coefficient + 'e' + getBaseLog(10,valDecimal).add(0.01).floor().toString();
    } else if (valDecimal.gte('1e33') && valDecimal.lt('1e1000')) {
        const formatted = valDecimal.toExponential(2);
        const parts = formatted.split('e');
        parts[0] = parts[0].includes('.') ? parts[0].padEnd(4, '0') : parts[0] + '.00';
        parts[1] = parts[1].replace(/\+/, '');
        return parts.join('e');
    } else if (valDecimal.gte('1e6') && valDecimal.lt('1e33')) {
        let logarithm = getBaseLog(1000,valDecimal.add(0.001)).floor();
        let newVal = valDecimal.add(0.001).div(new Decimal('1000').pow(logarithm))
        let logarithm2 = getBaseLog(10,newVal)
        const formattedValue = newVal.toFixed(4-logarithm2);
    
        return formattedValue+Abbreviations[logarithm.toString()-1];
    } else if (valDecimal.lt('1e3')) {
        return RoundNum(valDecimal).toString();
    } else {
        return valDecimal.floor().toString(); 
    }
}

function GenerateClicks() {
    boostCombC = new Decimal (1)
    boostCombC2 = new Decimal (1)

    if (decUp.up7 == true) {
        let base = 0.1
        if (decUp.up9 == true) {
            base = base + 0.1
        }
        if (decUp.up12 == true) {
            base = base + 0.05
        }
        if (decUp.up16 == true) {
            base = base + 0.1
        }
        if (decUp.up18 == true) {
            base = base + 0.05
        }
        if (decUp.up19 == true) {
            let a = 0
            for (i = 1; i <= upgradeAmt; i++) {
                if (document.getElementById("upDis"+i).innerHTML == "Bought!") {
                    a = a + 0.002
                }
            }
            base = base + a
            document.getElementById("upDis19").innerHTML = "Currently: +"+(Math.floor(a*1000))/1000+" base"
        }
        let Formula = clicks.pow(base).add(1)
        boostCombC = Formula
        document.getElementById("upDis7").innerHTML = "Currently: "+Format(Formula)+"x Points"
        base = 0.1
    }

    if (decUp.up22 == true) {
        let base = 0.05
        if (decUp.up25 == true) {
            base = base + 0.05
        }
        let Formula = clicks.pow(base).add(1)
        boostCombC2 = Formula
        document.getElementById("upDis22").innerHTML = "Currently: "+Format(Formula)+"x Points"
        base = 0.05
    }

    decimalClickBoost = boostCombC.times(boostCombC2)

    let gain = clickGain.mul(decimalClickBoost)
    clicks = clicks.add(gain)
    totalClicks = totalClicks.add(gain)
    clickDisplay = Format(clicks)
    document.getElementById("ClickDisplay").innerHTML = clickDisplay
}

function Loop() {
    GenerateClicks()
    setTimeout(Loop, 100)
}

function upgrade(upAmo, price, type, boost) {
    price = new Decimal(price)
    if (clicks.gte(price) && document.getElementById("upDis"+upAmo).innerHTML != "Bought!" && type != 0) {
        clicks = clicks.sub(price)
        document.getElementById("upDis"+upAmo).innerHTML = "Bought!"
        document.getElementById("ClickDisplay").innerHTML = Format(clicks)
        console.log("BOUGHT")
        if (upAmo != upgradeAmt) {
            document.getElementById("Upgrade"+(upAmo+1)).style.visibility = "visible"
        }

        if (type == 1) {
            clickGain = clickGain.times(boost)
        }
    } else if (type == 0) {
        if (clicks.gte(price) && decUp["up"+upAmo] == false) {
            clicks = clicks.sub(price)
            document.getElementById("upDis"+upAmo).innerHTML = "Bought!"
            document.getElementById("ClickDisplay").innerHTML = Format(clicks)
            console.log("BOUGHT")
            if (upAmo != upgradeAmt) {
                document.getElementById("Upgrade"+(upAmo+1)).style.visibility = "visible"
            }
            decUp["up"+upAmo] = true
        }
    }
}
