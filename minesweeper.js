// 屏蔽浏览器中鼠标右键默认的弹出菜单事件
document.oncontextmenu = function(e){
    e.preventDefault();
};
let box = document.querySelector("#box");
let rowEle = document.querySelector("#row");
let mineEle = document.querySelector("#mine");
let getFormBtn = document.querySelector("#getForm");
let gameOverInfoEle = document.querySelector("#gameOverInfo");
getFormBtn.onclick = function () {
    let row = rowEle.value;//地图行数
    let col = rowEle.value;//地图列数
    let mineCount = mineEle.value;//地雷个数
    gameOverInfoEle.innerText = "​";
    let a = [];//用来储存随机生成的地雷的索引
    if(row < 3){
        alert("行/列数不得小于3，请重新输入！");
    }else if(mineCount < 1 || mineCount > Math.ceil(row * col * 0.25)){
        alert("雷数设置不合理，请重新输入！(雷数最多为总格数的25%)");
    }else{
        box.style.opacity = 1;
        box.innerHTML = "";//清除旧的地图
        // 随机生成地雷的索引
        for (let i = 0; ; i++) {
            let randomNumber = Math.floor(Math.random()*(row * col - 1));
            if(!a.includes(randomNumber)){
                a.push(randomNumber);
            }
            if (a.length == mineCount){
                break;
            }
        }
        // 判断地图上某个坐标是否在数组（保存地雷索引的数组）中（用来判断某格是否是雷）
        function include(x,y,arr) {
            for (let i = 0; i < arr.length; i++) {
                if(x*col + y == arr[i]){
                    return true;
                }
            }
            return false;
        }
        // 用来判断坐标是否出界
        function isOutOfBounds(x, y) {
            if(x < 0 || y < 0 || x >= row || y >= col){
                return true;
            }else{
                return false;
            }
        }
        // 用来返回某个坐标周围的雷数
        function boom(x,y) {
            let count = 0;
            if (include(x,y,a)){
                return -1;
            }
            for (let i = (x - 1); i < (x + 2); i++) {
                for (let j = (y - 1); j < (y + 2); j++) {
                    if(i == x && j == y){
                        continue;
                    }else{
                        if(!isOutOfBounds(i,j)){
                            if(include(i,j,a)){
                                count++;
                            }
                        }
                    }
                }
            }
            return count;
        }
        // 返回某个坐标的DOM对象
        function findCell(x, y) {
            let cells = document.querySelectorAll(".cell");
            return cells[x*row + y];
        }
        // 自动翻开无雷区域
        function removeBlank(x,y) {
            let boomCount = boom(x,y);
            if(boomCount == 0){
                findCell(x,y).innerText = "0";
                findCell(x,y).style.backgroundColor = "yellowgreen";
                let temp = 0;
                for (let i = (x - 1); i < (x + 2); i++) {
                    for (let j = (y - 1); j < (y + 2); j++) {
                        temp++;
                        if(!(i == x && j == y)){
                            if(!isOutOfBounds(i,j)){
                                if (findCell(i,j).innerText != ""){
                                    continue;
                                }
                                let boomCount1 = boom(i,j);
                                if(boomCount1 != 0){
                                    findCell(i,j).innerText = boomCount1;
                                    findCell(i,j).style.backgroundColor = "yellowgreen";
                                }else{
                                    removeBlank(i,j);
                                }
                            }
                        }
                    }
                }
            }else{
                findCell(x,y).innerText = boomCount;
                findCell(x,y).style.backgroundColor = "yellowgreen";
            }
        }
        // 判断是否胜利
        function isWin() {
            let cells = document.querySelectorAll(".cell");
            let blankCount = 0;//未翻开的空白格的数量
            let flagCount = 0;//标记旗帜的数量
            for (let i = 0; i < cells.length; i++) {
                if(cells[i].innerText == ""){
                    blankCount++;
                }else if(cells[i].innerText == "🚩"){
                    flagCount++;
                }
            }
            if (blankCount > mineCount){
                return false;// 空白格大于雷数，说明还有未翻开的无雷格子
            }else if (blankCount == mineCount){
                if (flagCount == 0){
                    return true;//空白格等于雷数，同时旗帜数为0，说明玩家没有插旗，所有空白格都是地雷
                }else{
                    return false;
                }
            }else{
                if (blankCount == 0){
                    if(flagCount == mineCount){
                        return true;//空白格等于零，说明没有未翻开的格子，而旗帜数等于雷数，所有旗帜格下都是地雷
                    }
                }else{
                    if (blankCount + flagCount == mineCount){
                        return true;//空白格小于雷数且不等于零，说明玩家已经用旗帜标记了部分地雷，如果空白格数加旗帜格数等于雷数，说明空白格都是地雷
                    }
                }
                return false;
            }
        }
        // 切换成游戏结束后的地图（所有雷和雷数标记显示出来）
        function gameOver() {
            let cells = document.querySelectorAll(".cell");
            let index = 0;
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    if(a.includes(index)){
                        cells[index].innerText = "💣";
                        cells[index].style.backgroundColor = "orange";
                    }else{
                        let boomCount = boom(i,j);
                        cells[index].innerText = boomCount;
                        cells[index].style.backgroundColor = "yellowgreen";
                    }
                    index++;
                }
            }
        }
        // console.log(a);
        box.style.width = 50 * col + "px";
        box.style.height = 50 * row + "px";
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                let cell = document.createElement("div");
                cell.classList.add("cell");
                box.appendChild(cell);
                cell.onmousedown = function (e) {
                    // 鼠标左键翻开格子
                    if (e.button == 0){
                        if (boom(i,j) == -1){
                            cell.innerText = "💣";
                            alert("你输啦!");
                            gameOverInfoEle.innerText = "很遗憾，你输啦！";
                            if(gameOverInfoEle.classList.contains("green")){
                                gameOverInfoEle.classList.remove("green");
                            }
                            gameOverInfoEle.classList.add("red");
                            gameOver();
                        }else{
                            removeBlank(i,j);
                            if (isWin()){
                                alert("恭喜你，你赢啦!");
                                gameOverInfoEle.innerText = "恭喜你，你赢啦!";
                                if(gameOverInfoEle.classList.contains("red")){
                                    gameOverInfoEle.classList.remove("red");
                                }
                                gameOverInfoEle.classList.add("green");
                                gameOver();
                            }
                        }
                        // 鼠标右键用旗帜标记地雷
                    }else if(e.button == 2){
                        if (cell.innerText == ""){
                            cell.innerText = "🚩";
                            cell.style.backgroundColor = "#ffff00";
                            if (isWin()){
                                alert("恭喜你，你赢啦!");
                                gameOverInfoEle.innerText = "恭喜你，你赢啦!";
                                if(gameOverInfoEle.classList.contains("red")){
                                    gameOverInfoEle.classList.remove("red");
                                }
                                gameOverInfoEle.classList.add("green");
                                gameOver();
                            }
                        }
                        // 鼠标滑轮取消标记旗帜
                    }else if(e.button == 1){
                        if (cell.innerText == "🚩"){
                            cell.innerText = "";
                            cell.style.backgroundColor = "transparent";
                        }
                    }
                }
            }
        }
    }
}