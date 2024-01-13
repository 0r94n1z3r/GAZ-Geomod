export const beautifyDate = (date, noFormat)=>{
    const now = new Date();
    let res = '';

    const addZero = (num)=>{
        return  `${num<10?'0':''}${num}`
    }

    let year = false;
    
    if(!noFormat && now - date <= 86400000 && now >= date){
        res += 'Сегодня, ';
    }else if(!noFormat && now - date <= 86400000*2 && now >= date){
        res += 'Вчера, ';
    }else{
        year = true;
    }

    res += addZero(date.getDate())+'.'+addZero(date.getMonth() + 1);
    
    if(year){
        res += '.'+date.getFullYear()
    }

    return res;
}

export const round = (
    num, 
    dec, 
    options /*splitThree, constantDecimal*/
)=>{
    num = parseFloat(num||0);;
    dec = dec||0;

    let numArr = num.toFixed(dec).split('.');
    let fract = (parseFloat('.'+numArr[1])+'').slice(2);

    if(options?.splitThree){
        numArr[0] = numArr[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    if(dec == 0)return numArr[0];

    if(options?.constantDecimal){
        fract = numArr[1]
    }

    return `${numArr[0]}${fract?'.':''}${fract||''}`;
}

export const roundedVal = (maxVal, val)=>{
    let res = {text: '', value: 0, base: 1};

    if(maxVal < 1000){
        res.text ='';
        res.value = round(val, 2);
        res.base = 1;
    }else if(maxVal < 1000000){
        res.text ='тыс.';
        res.value = round(val/1000, 2);
        res.base = 1000;
    }else if(maxVal < 1000000000){
        res.text ='млн.';
        res.value = round(val/1000000, 2);
        res.base = 1000000;
    }else if(maxVal < 1000000000000){
        res.text ='млрд.';
        res.value = round(val/1000000000, 2);
        res.base = 1000000000;
    }else if(maxVal < 1000000000000000){
        res.text ='трлн.';
        res.value = round(val/1000000000000, 2);
        res.base = 1000000000000;
    }else{ 
        res.text ='';
        res.value = round(val, 2);
        res.base = 1;
    }

    return res;
}

export const sortByKey = (a,b,key, v=1)=>{
    if ( a[key] < b[key] ) return -1*v;
    if ( a[key] > b[key] ) return 1*v;
    return 0;
}