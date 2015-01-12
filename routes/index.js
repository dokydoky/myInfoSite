var async = require('async');
var fs = require('fs');


// rootPage CRUD
exports.index = function(req, res){
    var check = ( req.currentUser ) ? 1 : 0;
    res.render('index', {check: check});
};

function isPictureSent(picture){
    var splited = picture.path.split('/');

    if(picture){
        if(picture.size){
            var name = splited[splited.length-1];
            return name;
        } else{
            fs.unlink(picture.path, function(){});
        }
    }
    return null;
}

exports.createInfo = function(req, res){
    var check = ( req.currentUser ) ? 1 : 0;
    var categories = req.body.categories;
    var subject = req.body.subject;
    var content = req.body.content;
    var favorite = (req.body.favorite) ? 1 : 0;
    var secret = (req.body.secret) ? 1 : 0;
    var picture1 = isPictureSent(req.files.picture1);
    var picture2 = isPictureSent(req.files.picture2);
    var picture3 = isPictureSent(req.files.picture3);
    var picture4 = isPictureSent(req.files.picture4);

    var contentQ = "";
    var sumnailQ = "";

    // user 검사
    if(!check){
        res.send('<script>alert("invalid access");location.href="/"</script>');
        return;
    }

    // content 추가
    if(picture1){
        contentQ = '<p><img src="/images/board/' + picture1 + '" class="img-responsive" /></p>';
        sumnailQ = '/images/board/' + picture1;
    }
    if(picture2) contentQ = contentQ + '<p><img src="/images/board/' + picture2 + '" class="img-responsive" /></p>';
    if(picture3) contentQ = contentQ + '<p><img src="/images/board/' + picture3 + '" class="img-responsive" /></p>';
    if(picture4) contentQ = contentQ + '<p><img src="/images/board/' + picture4 + '" class="img-responsive" /></p>';
    contentQ = contentQ + content;

    // sumnail 추가
    if(picture2 && !sumnailQ) sumnailQ = '/images/board/' + picture2;
    if(picture3 && !sumnailQ) sumnailQ = '/images/board/' + picture3;
    if(picture4 && !sumnailQ) sumnailQ = '/images/board/' + picture4;

    var insertQuery = 'INSERT INTO b_board(b_regDate, b_modDate, b_subject, b_content, b_isSecret, b_isFavorite, b_sumnail) VALUES(now(), now(), \'' + subject + '\', \'' + contentQ + '\', ' + secret + ', ' + favorite + ', \'' + sumnailQ + '\');'
    var idSelectQuery = 'SELECT b_id FROM b_board WHERE b_sumnail = "' + sumnailQ  + '";'

    INFO_Pool.getConnection(function(err, connection){
        async.waterfall([
            function(cb){
                // b_board 데이터 삽입
                connection.query(insertQuery, cb);
            },
            function(insertResult, gar, cb){
                // b_board에 삽입된 row의 b_id 확인
                connection.query(idSelectQuery, cb);
            },
            function(ids, gar, cb){
                // c_category에 카테고리 입력
                var b_id = ids[0].b_id;
                var classifyQuery;

                for(var i=0; categories[i]; i++){
                    switch(categories[i]){
                    case 'f_incheon':
                        if(i==0) classifyQuery = 'INSERT INTO cc_classify VALUES(' + b_id + ', 1)';
                        else     classifyQuery = classifyQuery + ', (' + b_id + ', 1)';
                        break;
                    case 'f_bucheon':
                        if(i==0) classifyQuery = 'INSERT INTO cc_classify VALUES(' + b_id + ', 3)';
                        else     classifyQuery = classifyQuery + ', (' + b_id + ', 3)';
                        break;
                    case 'f_gangnam':
                        if(i==0) classifyQuery = 'INSERT INTO cc_classify VALUES(' + b_id + ', 2)';
                        else     classifyQuery = classifyQuery + ', (' + b_id + ', 2)';
                        break;
                    case 'n_INU':
                        if(i==0) classifyQuery = 'INSERT INTO cc_classify VALUES(' + b_id + ', 4)';
                        else     classifyQuery = classifyQuery + ', (' + b_id + ', 4)';
                        break;
                    case 'n_INUdorm':
                        if(i==0) classifyQuery = 'INSERT INTO cc_classify VALUES(' + b_id + ', 5)';
                        else     classifyQuery = classifyQuery + ', (' + b_id + ', 5)';
                        break;
                    }
                }
                classifyQuery = classifyQuery + ';';
                connection.query(classifyQuery, cb);
            }
        ],
        function(err, results){
            if(err){
                connection.release();
                res.send("create Error");
                return;
            } else{
                connection.release();
                res.redirect('/');
            }
        });
    });
};

exports.readInfo = function(req, res){
    var page = parseInt(req.params.page);
    var category = req.params.category;
    //var keyword = req.params.keyword;

    //var selectQuery1 = "select count(b_id) AS cnt from b_board;";
    var selectQuery1 = makeCntQuery(page, category); // 수정필요
    var selectQuery2 = makeQuery(page, category);

    INFO_Pool.getConnection(function(err, connection){
        async.parallel([
            function(cb){
                connection.query(selectQuery1, cb);
            },
            function(cb){
                connection.query(selectQuery2, cb);
            },
        ],
        function(err, results){
            if(err){
                connection.release();
                res.send("getConnection Error");
                return;
            } else{
                connection.release();
                res.render('board', {count: results[0][0], data: results[1][0], curPage: page, category: category});
            }
        });
    });
};

exports.detailInfo = function(req, res){
    var check = ( req.currentUser ) ? 1 : 0;
    var id = parseInt(req.params.id);
    var selectQuery = "select b_regDate AS regDate, b_modDate AS modDate, b_isAuto AS isAuto, b_keyword AS keyword, b_content AS content, b_subject AS subject, b_isFavorite AS isFavorite from b_board WHERE b_id = " + id + ";";

    INFO_Pool.getConnection(function(err, connection){
        connection.query(selectQuery, function(err, results){                                             
            if(err){
                connection.release();
                res.send("getConnection Error");
                return;
            } else{
                connection.release();
                res.render('boardDetail', {results: results, check: check});
            }
        });                                                                                               
    });
}

exports.updateInfo = function(req, res){
    res.redirect('/read/1');
}

exports.deleteInfo = function(req, res){
    res.redirect('/read/1');
}



// keyword CRUD
exports.keyword = function(req, res){
    var check = ( req.currentUser ) ? 1 : 0;
    var page = parseInt(req.params.page);
    var selectQuery1 = "select count(k_id) AS totalCnt from k_keywordList;";
    var selectQuery2 = "select count(k.k_id) AS cnt from k_keywordList k, s_siteList s where k.k_id = s.s_keywordID group by k.k_id LIMIT " + 5*(page-1) + ",5;";
    var selectQuery3 = "select k.k_id AS id, k.k_keyword AS keyword, k.k_isAlarm AS isAlarm, k.k_isDelete AS isDelete, k.k_lastSearch AS lastSearch, s.s_site AS sites, s.s_templete AS templete from k_keywordList k, s_siteList s where k.k_id = s.s_keywordID;";

    INFO_Pool.getConnection(function(err, connection){
        connection.query(selectQuery1, function(err, totalCnt){
            if(err){
                connection.release();
                res.send("getConnection Error 1");
                return;
            } else{
                connection.query(selectQuery2, function(err, cntResults){
                    if(err){
                        connection.release();
                        res.send("getConnection Error 2");
                        return;
                    } else{
                        connection.query(selectQuery3, function(err, results){
                            if(err){
                                connection.release();
                                res.send("getConnection Error 3");
                                return;
                            } else{
                                connection.release();
                                if( req.currentUser ){
                                    res.render('keyword', {check: check, total: totalCnt, curPage: page, results: results, cntResults: cntResults});
                                } else{
                                    //res.render('keyword', {check: check, total: totalCnt, curPage: page, results: results, cntResults: cntResults});
                                    res.send('<script>alert("invalid access");location.href="/"</script>');
                                    return;
                                }
                            }
                        });
                    }
                });
            }
        });
    });
}



// log CRUD
exports.log = function(req, res){
    var check = ( req.currentUser ) ? 1 : 0;
    var page = parseInt(req.params.page);
    var selectQuery1 = "select count(p_id) AS totalCnt from p_pushLog;";
    var selectQuery2 = "select k.k_keyword AS keyword, p.p_sendDate AS sendDate, p.p_content AS content, p.p_isSucc AS isSucc, p.p_sentCount AS sentCnt from k_keywordList k, p_pushLog p WHERE p.p_keywordID = k.k_id ORDER BY p.p_id DESC LIMIT " + 30*(page-1) + ",30;";

    INFO_Pool.getConnection(function(err, connection){
        connection.query(selectQuery1, function(err, totalCnt){                                             
            if(err){
                connection.release();
                res.render('log', {check: check, results: ''});
            } else{
                connection.query(selectQuery2, function(err, results){                                             
                    if(err){
                        connection.release();
                        res.render('log', {check: check, results: ''});
                    } else{
                        connection.release();
                        if( req.currentUser ){
                            res.render('log', {check: check, total: totalCnt, curPage: page, results: results});
                        } else{
                            //res.render('log', {check: check, total: totalCnt, curPage: page, results: results});
                            res.send('<script>alert("invalid access");location.href="/"</script>');
                            return;
                        }
                    }
                });                                                                                               
            }
        });                                                                                               
    });
};

exports.login = function(req, res){
    var id = req.body.id || '';
    var pw = req.body.pass || '';
    if( !id || !pw ){
        res.json({result: 0, data: "There are not id or pw"});
    }

    var selectQuery = "select a_id from a_account where a_id='" + id + "' and a_pw='" + pw + "';";

    INFO_Pool.getConnection(function(err, connection){
        connection.query(selectQuery, function(err, results){                                             
            if(err){
                connection.release();
                res.json({result: 0, data: 'Error'});
            } else{
                connection.release();
                if( results.length == 1 ){
                    req.session.user_id = id;
                    res.json({result: 1, data: 'Login Success'});
                } else {
                    res.json({result: 0, data: 'Login Fail'});
                }
            }
        });                                                                                               
    });
};

exports.logout = function(req, res){
    if( req.session ){
        req.session.destroy(function(){});
    }
    res.redirect('/');
}

function makeCntQuery(page, category){
    var ret;

    switch(category){
    case "all":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id;'
        break;
    case "f_all":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="강남" or c.c_name="인천" or c.c_name="부천";'
        break;
    case "f_incheon":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="강남";'
        break;
    case "f_bucheon":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="부천";'
        break;
        break;
    case "f_gangnam":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="강남";'
        break;
    case "n_all":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="인천대" or c.c_name="인천대기숙사";'
        break;
    case "n_INU":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="인천대";'
        break;
    case "n_INUdorm":
        ret = 'select count(distinct(b_id)) AS cnt from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id where c.c_name="인천대기숙사";'
        break;
    default:
        console.log("no matched category");
        return "";
    }

    return ret;
}

function makeQuery(page, category){
    var ret;
    var cateQ;
    var tailQ;

    switch(category){
    case "all":
        cateQ = "group_concat(c.c_name) AS category";
        tailQ = "GROUP BY id";
        break;
    case "f_all":
        cateQ = "group_concat(c.c_name) AS category";
        tailQ = 'GROUP BY id HAVING upperCat="Food"';
        break;
    case "f_incheon":
        cateQ = "c.c_name AS category";
        tailQ = 'WHERE c.c_name="인천"';
        break;
    case "f_bucheon":
        cateQ = "c.c_name AS category";
        tailQ = 'WHERE c.c_name="부천"';
        break;
    case "f_gangnam":
        cateQ = "c.c_name AS category";
        tailQ = 'WHERE c.c_name="강남"';
        break;
    case "n_all":
        cateQ = "group_concat(c.c_name) AS category";
        tailQ = 'GROUP BY id HAVING upperCat="Notice"';
        break;
    case "n_INU":
        cateQ = "c.c_name AS category";
        tailQ = 'WHERE c.c_name="인천대"';
        break;
    case "n_INUdorm":
        cateQ = "c.c_name AS category";
        tailQ = 'WHERE c.c_name="인천대기숙사"';
        break;
    default:
        console.log("no matched category");
        return "";
    }

    ret = "select b.b_id AS id, b.b_viewCount AS viewCount, b.b_subject AS subject, b.b_sumnail AS sumnail, b.b_isFavorite AS isFavorite, " +
          cateQ + 
          ", u.u_name AS upperCat from b_board b LEFT OUTER JOIN cc_classify cc ON b.b_id = cc.cc_boardID LEFT OUTER JOIN c_category c ON cc.cc_catID = c.c_id LEFT OUTER JOIN u_upperCategory u ON c.c_upperCatID = u.u_id " + 
          tailQ +
         " ORDER BY b.b_id ASC LIMIT " + 8*(page-1) + ",8;";

    return ret;
}

























