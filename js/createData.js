let getRandom=function(m,n){
    return Math.round(Math.random()*(n-m)+m);
};
let getRandomPhone=function(){
    let str='';
  for (let i=0;i<10;i++){
      str+=getRandom(0,9);
  }
  return str;
};
let lastName="赵钱孙李周吴郑王宋朱柯冷张罗余杨唐常谢韩徐苏";//22
let firstName="丹萌珠昕文梅雅天真童东南西北营圆晨婷宣佳颖冠";//22
let address=['贵州省','江苏省','浙江省','山东省','北京','安徽省'];

let arr=[];
for (let i = 0; i < 100; i++) {
   let obj={};
   obj.id=i+1;
   obj.userName=lastName[getRandom(0,21)]+firstName[getRandom(0,21)];
   obj.userAge=getRandom(18,80);
   obj.userPhone='1'+getRandomPhone();
   obj.userAddress=address[getRandom(0,5)];
    arr.push(obj);
}
let fs=require('fs');
fs.writeFileSync('CRM客户管理系统/json/customer.json',JSON.stringify(arr),'utf-8');
