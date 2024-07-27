$(document).ready(function () {
    var userAgent = navigator.userAgent.toLowerCase();
    var isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    if (isMobile) {
        $('link[href^="css/chat.css"]').attr('href', 'css/chat_mb.css');
    }

    function isValidChatRecordMaxNum(value) {
        if (value === null || value === undefined || value === "") {
            return false;
        }
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 5000) {
            return false;
        }
        return true;
    }

    var chat_record_maxnum = 100;
    var cm = localStorage.getItem("chat_record_maxnum");
    try {
        if (isValidChatRecordMaxNum(cm)) {
            chat_record_maxnum = cm;
        } else {
            localStorage.setItem("chat_record_maxnum", 100);
        }
    } catch (error) {
        console.log(error);
    }

    var username = localStorage.getItem("username");
    var password = localStorage.getItem("password");
    var WsPassword = username + "&" + password;

    if (!username && !password) {
        $(".masking").fadeIn();
    }

    $(".login").click(function () {
        localStorage.setItem("username", $("#usr").val());
        localStorage.setItem("password", $("#pwd").val());
        username = localStorage.getItem("username");
        password = localStorage.getItem("password");
        WsPassword = username + "&" + password;
        linkws();
        location.reload();
    });

    if (!localStorage.getItem("chatbgurl")) {
        localStorage.setItem("chatbgurl", "https://www.loliapi.com/acg/");
    }

    var chatbgurl = localStorage.getItem("chatbgurl");
    var isUsebg = localStorage.getItem("isUsebg");
    $('#chat_middle_item').css('background-image', isUsebg ? 'url(' + chatbgurl + ')' : 'url(http://127.0.0.1/null/)');

    function tips(sender) {
        let ans = '<div class="othernews"><div class="intext">' + sender + '</div></div>';
        $("#chat_middle_item").append(ans);
        $("#chat_middle_item").animate({
            scrollTop: $("#chat_middle_item")[0].scrollHeight
        }, 1000);
        setChatRecord(2, "", sender);
    }

    var wsc;
    if (!localStorage.getItem("wscUrl")) {
        localStorage.setItem("wscUrl", "ws://mc.szzz666.top:28664");
    }
    var wscUrl = localStorage.getItem("wscUrl");
    linkws(wscUrl);
    var isConnected = false;
    timeoutId = setTimeout(function () {
        if (!isConnected) {
            console.log("WebSocket 连接超时");
            autoSwict();
        }
    }, 3000);
    function linkws(url) {
        wsc = new WebSocket(url);
        wsc.onopen = function () {
            console.log("WebSocket 连接已建立。");
            isConnected = true;
            clearTimeout(timeoutId); // 清除超时定时器
            let AuthMsg = { type: "Auth", password: WsPassword };
            wsc.send(JSON.stringify(AuthMsg));
        };
        wsc.onerror = function () {
            console.log("WebSocket 连接出错。");
            console.log(wscUrl);
            autoSwict();
        };
    }
    function autoSwict() {
        if (wscUrl != "ws://192.168.0.42:28664") {
            localStorage.setItem("wscUrl", "ws://192.168.0.42:28664");
        } else {
            localStorage.setItem("wscUrl", "ws://mc.szzz666.top:28664");
        }
        location.reload();
    }

    function setChatRecord(type, name, msg) {
        let cr = JSON.parse(localStorage.getItem("chat_record")) || { cr: [] };
        cr.cr.push({ type: type, name: name, msg: msg });
        if (cr.cr.length > chat_record_maxnum) {
            cr.cr.splice(0, cr.cr.length - chat_record_maxnum);
        }
        localStorage.setItem("chat_record", JSON.stringify(cr));
    }

    function showChatRecord() {
        var cr = JSON.parse(localStorage.getItem("chat_record")) || { cr: [{ type: 2, name: "", msg: "无历史消息" }] };
        var fragment = document.createDocumentFragment();
        cr.cr.forEach(function (record) {
            let ans = '';
            if (record.type == 0) {
                ans = '<div class="chat_left clearfix"><div class="chat_left_item_1 clearfix"><i class="fa fa-users" style="font-size:20px"></i></div><div class="chat_left_item_2"><div class="chat_name clearfix">' + record.name + '</div><div class="chat_left_content clearfix">' + record.msg + '</div></div></div>';
            } else if (record.type == 1) {
                ans = '<div class="chat_right clearfix"><div class="chat_right_item_1 clearfix"><i class="fa fa-user" style="font-size:20px"></i></div><div class="chat_right_item_2"><div class="chat_right_name clearfix">' + record.name + '</div><div class="chat_right_content clearfix">' + record.msg + '</div></div></div>';
            } else {
                ans = '<div class="othernews"><div class="intext">' + record.msg + '</div></div>';
            }
            fragment.appendChild($(ans)[0]);
        });
        $("#chat_middle_item").append(fragment);
        $("#chat_middle_item").scrollTop($("#chat_middle_item")[0].scrollHeight);
        $("#chat_middle_item").css("opacity", "1");
    }

    $("#setingbtn").click(function () {
        $("#maxmsgnum").val(chat_record_maxnum);
        $("#chatbgurl").val(chatbgurl);
        $("#usebg").prop('checked', isUsebg);
    });

    $("#saveseting").click(function () {
        var mv = $("#maxmsgnum").val();
        if (isValidChatRecordMaxNum(mv)) {
            localStorage.setItem("chat_record_maxnum", mv);
            chat_record_maxnum = mv;
        }
        var newchatbgurl = $("#chatbgurl").val();
        localStorage.setItem("chatbgurl", newchatbgurl);
        $('#chat_middle_item').css('background-image', 'url(' + newchatbgurl + ')');
        isUsebg = $("#usebg").prop('checked');
        if (isUsebg) {
            localStorage.setItem("isUsebg", true);
        } else {
            localStorage.removeItem("isUsebg");
            $('#chat_middle_item').css('background-image', 'url(http://127.0.0.1/null/)');
        }
        tips("设置已保存");
    });

    $("#clearmsg").click(function () {
        localStorage.setItem("chat_record", JSON.stringify({ cr: [{ type: 2, name: "", msg: "无历史消息" }] }));
        $("#chat_middle_item").empty();
        tips("已清空历史消息");
    });

    $("#resetseting").click(function () {
        $("#maxmsgnum").val(100);
        $("#chatbgurl").val("https://www.loliapi.com/acg/");
        $('#usebg').prop('checked', false);
    });

    wsc.onmessage = function (msg) {
        console.log("收到消息：" + msg.data);
        var data = JSON.parse(msg.data);
        if (data.type != "Server") {
            if (msg.data == "200") {
                localStorage.setItem("isAuthSuccess", true);
                $(".masking").fadeOut();
                setTimeout(function () {
                    showChatRecord();
                }, 1500);
                tips("身份认证通过");
            } else {
                localStorage.removeItem("isAuthSuccess");
                tips("身份认证失败");
                if (localStorage.getItem("username") !== null) {
                    alert("身份认证失败,游戏名或密码错误");
                }
                $(".masking").fadeIn();
            }
        } else {
            let sender = data.text.replace(/§\w/g, '').split(" >> ")[0];
            let sesmsg = data.text.replace(/§\w/g, '').split(" >> ")[1];
            if (sesmsg !== undefined) {
                let ans = '<div class="chat_left clearfix"><div class="chat_left_item_1 clearfix"><i class="fa fa-users" style="font-size:20px"></i></div><div class="chat_left_item_2"><div class="chat_name clearfix">' + sender + '</div><div class="chat_left_content clearfix">' + sesmsg + '</div></div></div>';
                $("#chat_middle_item").append(ans);
                setChatRecord(0, sender, sesmsg);
                $("#chat_middle_item").animate({
                    scrollTop: $("#chat_middle_item")[0].scrollHeight
                }, 1000);
            } else {
                tips(sender);
            }
        }
    };

    function sendmsg() {
        let sesmsg = $("#chat_context_item").val();
        if (sesmsg !== '') {
            let ans = '<div class="chat_right clearfix"><div class="chat_right_item_1 clearfix"><i class="fa fa-user" style="font-size:20px"></i></div><div class="chat_right_item_2"><div class="chat_right_name clearfix">' + username + '</div><div class="chat_right_content clearfix">' + sesmsg + '</div></div></div>';
            $("#chat_middle_item").append(ans);
            setChatRecord(1, username, sesmsg);
            $('#chat_context_item').val('');
            let text = "§b[官方APP]§f " + username + " >> " + sesmsg;
            let Message = { type: "Server", text: text };
            wsc.send(JSON.stringify(Message));
            $("#chat_middle_item").animate({
                scrollTop: $("#chat_middle_item")[0].scrollHeight
            }, 1000);
        }
    }

    $("#commit_button").click(sendmsg);

    $('#chat_context_item').keydown(function (event) {
        if (event.keyCode === 13) {
            sendmsg();
            event.preventDefault();
        }
    });

    wsc.onclose = function () {
        console.log("WebSocket 连接已关闭。");
        setTimeout(function () {
            if (localStorage.getItem("isAuthSuccess")) {
                tips("自动重连");
                location.reload();
            }
        }, 2000);
    };
});