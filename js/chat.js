$(document).ready(function () {
    // 获取浏览器的User-Agent标识
    var userAgent = navigator.userAgent.toLowerCase();
    // 判断是否为移动设备
    var isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    if (isMobile) {
        $('link[href^="css/chat.css"]').attr('href', 'css/chat_mb.css');
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


    function tips(sender) {
        let ans = '<div class="othernews">' +
            '<div class="intext">' + sender + '</div>'
            + '</div > '
        $("#chat_middle_item").append(ans);
    }
    var wsc;
    linkws();
    function linkws() {
        wsc = new WebSocket("ws://mc.szzz666.top:28664");

        // wsc = new WebSocket("ws://127.0.0.1:28664");
        wsc.onopen = function () {
            console.log("WebSocket 连接已建立。");
            let AuthMsg = {
                type: "Auth",
                password: WsPassword
            };
            wsc.send(JSON.stringify(AuthMsg));
        };
    }


    // 当接收到服务器发送的消息时触发的事件处理函数
    wsc.onmessage = function (msg) {
        console.log("收到消息：" + msg.data);
        if (JSON.parse(msg.data).type != "Server") {
            if (msg.data == "200") {
                $(".masking").fadeOut();
                tips("身份认证通过")
            } else {
                tips("身份认证失败")
                if (localStorage.getItem("username") !== null) {
                    alert("身份认证失败,游戏名或密码错误")
                }
                $(".masking").fadeIn();
            }
        } else {
            let sender = JSON.parse(msg.data).text.replace(/§\w/g, '').split(" >> ")[0];
            let sesmsg = JSON.parse(msg.data).text.replace(/§\w/g, '').split(" >> ")[1];

            if (sesmsg !== undefined) {
                let ans = '<div class="chat_left clearfix">' +
                    '<div class="chat_left_item_1 clearfix">他</div>' +
                    '<div class="chat_left_item_2">' +
                    '<div class="chat_name clearfix">' + sender + '</div>' +
                    '<div class="chat_left_content clearfix">' + sesmsg + '</div>'
                    + '</div>';
                $("#chat_middle_item").append(ans);
            } else {
                tips(sender);
            }
            $("#chat_middle_item").scrollTop($("#chat_middle_item")[0].scrollHeight);
        }
    };

    function sendmsg() {
        let sender = username;
        let sesmsg = $("#chat_context_item").val();
        let ans = '<div class="chat_right clearfix">' +
            '<div class="chat_right_item_1 clearfix">我</div>' +
            '<div class="chat_right_item_2">' +
            '<div class="chat_right_name clearfix">' + sender + '</div>' +
            '<div class="chat_right_content clearfix">' + sesmsg + '</div>'
            + '</div>';
        if (sesmsg !== '')
            $("#chat_middle_item").append(ans);
        $('#chat_context_item').val('');
        let text = "[本服官网] " + sender + " >> " + sesmsg;
        let Message = { "type": "Server", "text": text };
        wsc.send(JSON.stringify(Message));
        $("#chat_middle_item").scrollTop($("#chat_middle_item")[0].scrollHeight);
    }
    $("#commit_button").click(function () {
        sendmsg();
    });
    //键盘回车发送消息
    $('#chat_context_item').keydown(function (event) {
        if (event.keyCode === 13) {
            // 针对特定元素，如输入框id为'inputId'，回车键被按下时执行的代码
            sendmsg();
            event.preventDefault(); // 阻止默认行为，如表单提交
            // 可以在这里添加自定义操作
        }
    });

    // 当 WebSocket 连接关闭时触发的事件处理函数
    wsc.onclose = function () {
        console.log("WebSocket 连接已关闭。");
        tips("与服务器的连接已断开");
    };
});