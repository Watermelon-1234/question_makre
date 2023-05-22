// 變數定義
var currentLevel = 1;
//var maxLevel = 99999;
var wrongAnswers = 0;
var maxWrongAnswers = 3;
var pre_prompt="請輸出一個可以確切選出肯定只有一個答案而且正確的答案並非一個範圍、而且各個選項內容、不同題目、也不是主觀看法的四選一選擇題問題，而且答案只有一個,選項內容不能相同或是重複，如果難度的下限和上限分別是1和99999、而且5以下是普遍國小學生能輕鬆解答的題目、200以上的難度就是專家難度，那請輸出難度為";
var end_prompt="且問題及答案都是相當確切的的選擇題，一開始一定要有一個內容完整表達的問題，四個選項在最後輸出。 選項的內容必須是和問題有關，但不能相同,不能有兩個一樣的選項。每個選項開頭都用㏎當作記號(題目不用)，如果那一個選項是正確答案在開頭的就改成㎡，但是答案是第幾個選項得是隨機的。並用㏄為詳解的開始符號，最後要說和哪些領域相關，還有難度。題目要有以上特性:有明確的正確答案、測試知識面廣、內容要是已經被許多人證實正確的內容、題目沒有歧義。以上所提到每一個輸出的項目之間都要換行 並在最後輸出一個㊣做為結束符號。";
var my_prompt;
var form;
var aikey;//為了api key做準備
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js'
import { getDatabase, ref, child, get } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
$(document).ready(nextQuestion());
    
    $(document).ready(key_get());

function fade()
{
    $("#status").fadeOut(3000); 
    $("#preloader").fadeOut(3000);
}
function loading()
{
    $("#status").fadeIn(1000); 
    $("#preloader").fadeIn(1000);
}
function replacePrompt() {
    my_prompt=pre_prompt+currentLevel+end_prompt;
}

function nextQuestion() {
    replacePrompt();
    loading();
    document.getElementById("level").innerHTML=currentLevel;
    document.getElementById("wrongHeader").innerHTML=wrongAnswers+"/3";

    // 进入下一题
    if(currentLevel>1)
    {
        console.log("deleting...");
        form = document.getElementsByTagName("form")[0]; // 獲取第一个form元素
        form.remove(); // 删除原有的form元素
        form = document.createElement("form"); // 创建新的form元素
        
    }		
    post_and_show();
            
}
function key_get()
{
    
    const firebaseConfig = {
        apiKey: "AIzaSyAYtIeZWT_M_X6_IeCHTT17CgLctAhcy8s",
        authDomain: "answer-to-die.firebaseapp.com",
        databaseURL: "https://answer-to-die-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "answer-to-die",
        storageBucket: "answer-to-die.appspot.com",
        messagingSenderId: "673916292338",
        appId: "1:673916292338:web:cc3948b7c97c902faa146b"
    };

    // Initialize Firebase
    var firebase=initializeApp(firebaseConfig);

    //getData
    const dbRef = ref(getDatabase());
    get(child(dbRef,'/api/openAI/key')).then((snapshot) => {
    if (snapshot.exists()) {
        aikey = snapshot.val();
    } else {
        console.log("firebase:No data available");
    }
    }).catch((error) => {
    console.error("firebase error:"+error);
    });
}
function post_and_show()
    {
        $.ajax({
            url: "https://api.openai.com/v1/completions",
            type: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+aikey
            },
            data: JSON.stringify({
                "model": "text-davinci-003",
                "prompt": my_prompt,
                "max_tokens": 1024,
                "temperature": 0.7,
                "n": 1,
                "stop": "㊣"
            }),
            success: function(result) {
                var response = JSON.parse(JSON.stringify(result));
                fade();
                var question = response.choices[0].text.trim();
                let lines = question.split("\n").map(line => line.trim());
                let analysisIndex = lines.findIndex(line => line.startsWith("㏄"));
                let analysis = lines.slice(analysisIndex + 1, analysisIndex + 4).join(" ");
                
                let options = [];
                let correctOptionIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    // 获取选项
                    if (i < analysisIndex && lines[i].startsWith("㏎")) {
                        let option = lines[i].substring(1).trim(); // 去除空格
                        options.push(option);
                    }
                    // 获取正确选项
                    if (lines[i].startsWith("㎡") && correctOptionIndex == -1) {
                        correctOptionIndex = i - 1;
                        let option = lines[i].substring(1).trim(); // 去除空格
                        options.push(option);
                    }
                    if (lines[i].startsWith("㏄")) {
                        analysis=lines[i].substring(1).trim(); // 去除空格
                        
                    }
                }

                // 檢查options中是否有重複的元素，如果有，重新發送post請求並重新處理字串
                if (new Set(options).size !== options.length /* || lines.length!==4 || analysis==NULL*/) {
                    console.log("options中有重複的元素，重新發送post請求並重新處理字串");
                    post_and_show();
                }
                else
                {
                    console.log(lines);
                    console.log(analysisIndex);
                    console.log(analysis);
                    // 根据正确选项的索引标识它
                    if (correctOptionIndex >= 0) {
                        //options[correctOptionIndex] =  + options[correctOptionIndex];
                    }
                    else console.log("ERROR");

                    console.log("题目选项：" + options.join(", "));
                    console.log("题目解析和相关信息：" + analysis);
                    question = question.replace(/(㏎|㎡|㏄).*/g, ""); // 用空字串替換匹配到的部分
                    document.getElementById("question").innerHTML = question;
                    
                    // 做form
                    // 生成一個表單元素
                    var form = document.createElement("form");

                    // 遍歷options陣列，為每個選項生成一個radio和一個label
                    for (var i = 0; i < options.length; i++) {

                    // 生成一個radio元素
                    var radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = "option";
                    radio.value = i;

                    // 生成一個label元素
                    var label = document.createElement("label");
                    label.textContent = options[i];

                    // 將radio和label添加到表單中
                    form.appendChild(radio);
                    form.appendChild(label);
                    }

                    // 生成一個送出按鈕
                    var submit = document.createElement("input");
                    submit.type = "submit";
                    submit.value = "送出";

                    // 為送出按鈕添加事件監聽器，判斷答案是否正確
                    submit.addEventListener("click", function (e) {

                    // 阻止表單的默認提交行為
                    e.preventDefault();

                    // 獲取選中的radio元素
                    var checkedOption = document.querySelector('input[name="option"]:checked');

                    // 如果沒有選中任何選項，提示用戶至少選擇一個選項
                    if (!checkedOption) {
                        alert("請至少選擇一個選項！");
                        return;
                    }

                    // 如果選中了正確的答案，提示用戶恭喜你答對了！否則提示用戶很抱歉答錯了！並顯示正確答案是什麼。
                    if (checkedOption.value == correctOptionIndex) {
                        alert("恭喜你答對了！"+"\n詳解:"+analysis);
                        currentLevel++;
                        nextQuestion();
                        
                    } 
                    else {
                        alert("很抱歉答錯了！正確答案是：" + options[correctOptionIndex]+"\n詳解:"+analysis);
                        wrongAnswers++;
                        if(maxWrongAnswers==wrongAnswers)
                        {
                            let youfail="失敗了喔 最佳成績是"+currentLevel+"點擊確定重新開始!";
                            alert(youfail);
                            window.location.reload();
                        }
                        else
                        {
                            currentLevel++;
                            
                            nextQuestion();
                            
            
                        }
                    }
                    });

                    // 將送出按鈕添加到表單中
                    form.appendChild(submit);

                    // 將表單添加到文檔中的某個位置，例如body元素中
                    document.body.appendChild(form);
                }
            },
            error: function() {
                var alarm="error!,error:"+response.choices[0].text.trim();
                alert(alarm);
            }
        });
    }
