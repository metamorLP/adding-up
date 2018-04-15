'use strict';
// requireでファイル読み込みする。
// 読み込むfsやreadlineは、Node.jsに入っているライブラリ。
const fs = require('fs');
const readline = require('readline');
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({'input':rs, 'output':{}});
const map = new Map(); // Mapは連想配列。key: 都道府県 value: 集計データのオブジェクト


// rl オブジェクトで line というイベントが発生したらこの無名関数を呼んでください、という意味
rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if (year == 2010 || year == 2015){
        let value = map.get(prefecture);
        if (!value){
            value = {
                popu10: 0,
                popu15: 15,
                change: null
            };
        }
        if (year == 2010){
            value.popu10 += popu;
        }
        if (year == 2015){
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }

    // console.log(lineString);
});

rl.resume();

// 下は for-of 構文。Map や Array の中身を of の前に与えられた変数に代入して
// for ループと同じことができます。配列に含まれる要素を使いたいだけで、添字は不要な場合に便利。

// Map に for-of を使うと、キーと値で要素が 2 つある配列が、前に与えられた変数（ここではpair）に代入されます。
// この例では、pair[0] でキーである都道府県名、 pair[1] で値である集計オブジェクトが得られる。

rl.on('close', () => { // closeイベントは、全ての行を読み込み終わった際に呼び出されます。
    for (let pair of map){  
        const value = pair[1]; 
        value.change = value.popu15 / value.popu10;
    }

    // sort に対して渡すこの関数は比較関数と言い、これによって並び替えをするルールを決めることができます。
    // 比較関数は 2 つの引数を受けとって、
    // 前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
    // pair2 を pair1 より前にしたいときは、正の整数、
    // pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります。
    const rankingArray = Array.from(map).sort((part1, part2) => {
        return part2[1].change - part1[1].change; 
    });

    // 下に出てくる map ですが、先ほどの連想配列の Map とは別のもので、 map 関数といいます。
    // map 関数は、 Array の要素それぞれを、与えられた関数を適用した内容に変換するというものです。
    const rankingString = rankingArray.map((pair) => {
        return pair[0] + ': ' + pair[1].popu10 + ' => ' + pair[1].popu15 + '  変化率: ' + pair[1].change;
    })

    console.log(rankingString);
})