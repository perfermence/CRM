//需要在服务器上搭建一个服务（监听一个端口），把我们的项目发布出去
let http=require('http'),
    fs=require('fs'),
    url=require('url'),
    mime=require('mime');

http.createServer(function (req,res) {
    let {pathname,query}=url.parse(req.url,true);

    //API数据接口的处理
    //1)获取所有客户信息
    //注意点：数据为空，则让获取的数据为'[]',防止json.parse('string')时报错
    if (pathname==='/getList'){
        let n=query.n;
        let data=fs.readFileSync('json/customer.json','utf-8');//utf-8的格式得到的是字符串
        if (!data){
           data='[]';
        }
        let pageList=10;//每一页展示的数量
        data=JSON.parse(data);
        let total=data.length/pageList;//总页数
        let dataList=[];
        for (let i=(n-1)*10;i<=n*10-1;i++){//返回指定页的数据
            dataList.push(data[i]);
        }
        let result={
            "code":0,
            "msg":"获取成功",
            "total":total,//总页数
            "data":dataList
        };
        if (dataList.length!==0){
            console.log(1);
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify(result));

        } else{
            console.log(2);
            result={
                "code":1,
                "msg":"获取失败",
            };
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify(result));
        }
        return;
    }
    //2)获取指定用户信息的接口(根据客户ID)
    //把客户端传递进来的ID获取到
    if (pathname==='/getInfo') {
        let id=query.id;
        let data=fs.readFileSync('json/customer.json','utf-8');
        if (!data){
            data='[]';
        }
        data=JSON.parse(data);
        let result=null;
        data.forEach(item=>{
            if (id==item.id){
                result=item;
                return;
            }//此处不要再设else，否则result在循环中会再改变值，得不到想要的结果。
        });
        if (result){
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify({
                "code":0,
                "msg":"获取成功",
                "data":result
            }))
        } else{
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify({
                "code":1,
                "msg":"获取失败",
            }))
        }
        return;
    }

    //3)删除指定客户信息(根据客户ID)
    if (pathname==='/removeInfo'){
        let id=query.id;
        let data=fs.readFileSync('json/customer.json','utf-8');
        data=JSON.parse(data);
        //data是数组
        let length=data.length;
        console.log(Object.prototype.toString.call(data));//[Object Array]
        for (let i=0;i<data.length;i++){
            if (id==data[i].id){
                data.splice(id-1,1);
                fs.writeFile('json/customer.json',JSON.stringify(data),(err,data)=>{
                    if (err){
                        console.log(err);
                    }
                });

            }
        }
        if (data.length<length){
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify({
                "code":0,
                "msg":"删除成功",
            }))
        } else{
            res.setHeader('Content-type','text/plain;charset=utf-8');
            res.end(JSON.stringify({
                "code":1,
                "msg":"没有匹配的信息可以删除",
            }))
        }
        return;
    }
    //4)增加客户信息
    if (pathname==='/addInfo'){
        let str='';
        req.on('data',(chunk)=>{
           str+=chunk;
        });
        req.on('end',()=>{
            str=JSON.parse(str);//将字符串转为对象
            let data=fs.readFileSync('json/customer.json','utf-8');
            if (!data){
                data='[]';
            }
            data=JSON.parse(data);
            data.length===0?str.id=1:str.id=parseInt(data[data.length-1].id)+1;
            data.push(str);
            fs.writeFile('json/customer.json',JSON.stringify(data),(err)=>{
                if (err){
                    res.setHeader('Content-Type',"text/plain;charset=utf-8");
                    res.end(JSON.stringify({
                        "code":1,
                        "msg":"增加失败，请重新尝试"

                    }))
                } else{
                    res.setHeader('Content-Type',"text/plain;charset=utf-8");
                    res.end(JSON.stringify({
                        "code":0,
                        "msg":"增加成功"

                    }))
                }
            });
        });
        return;
    }
    //5)修改客户信息
    //没有传进信息：修改失败
    if (pathname==='/updateInfo'){
        let str='';
        req.on('data',chunk=>{
            str+=chunk;//参数：请求主体中：'{"id":xx,"name":xxx,"age":xx,"phone":"xxxx","address":"xxxx"}'
        });
        req.on("end", function () {
            str=JSON.parse(str);
            let data=fs.readFileSync('json/customer.json','utf-8');
            data=JSON.parse(data);
           if (str){
               for (let i=0;i<data.length;i++){
                   if (str.id==data[i].id){
                       data[i]=str;
                       fs.writeFile('json/customer.json',JSON.stringify(data),function (err) {
                           if (err){
                               console.log(err);
                           }
                       });
                   }
               }
               res.setHeader('Content-Type',"text/plain;charset=utf-8");
               res.end(JSON.stringify(
                   {
                       "code":0,//0  成功  1失败
                       "msg":"修改成功",
                   }
               ))
           } else{
               res.setHeader('Content-Type',"text/plain;charset=utf-8");
               res.end(JSON.stringify(
                   {
                       "code":1,//0  成功  1失败
                       "msg":"请输入修改信息"

                   }
               ))
           }
        })
    }
    //404如果请求的地址不是上述任何一个，则提示不存在即可

    //处理静态文件
    fs.stat('.'+pathname,(err,stats)=>{
        if (err){
            // 文件不存在返回404
            res.statusCode=404;//not found
            res.end(`${pathname} NOT FOUND`);
        }else if (stats.isFile()){
           //读出文件并返回
            res.setHeader('Content-type',mime.getType(pathname)+';charset=utf-8');
            fs.createReadStream('.'+pathname).pipe(res);
        } else if (stats.isDirectory()){
            //如果是文件夹，则默认返回index.
            console.log('directory');
            res.setHeader('Content-type','text/html;charset=utf-8');
            fs.createReadStream('./index.html').pipe(res);
        }

    })
}).listen(3000,function () {
    console.log('port 3000 is running');
});









