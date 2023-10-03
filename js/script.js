var section = function(){
    let section = document.createElement('section')
    section.id = 'chessboard'

    let board = document.createElement('div')
    board.id = 'board'

    document.body.appendChild(section)
    section.appendChild(board)

}()

var completefen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"
var startingfen = completefen.split(" ")[0]
var letters = "abcdefgh"
var piecesrc ={ k : "resources\\Bk.png",
 q : "resources\\Bq.png",
 b : "resources\\Bb.png",
 n : "resources\\Bn.png",
 r : "resources\\Br.png",
 p : "resources\\Bp.png",
 K : "resources\\Wk.png",
 Q : "resources\\Wq.png",
 B : "resources\\Wb.png",
 N : "resources\\Wn.png",
 R : "resources\\Wr.png",
 P : "resources\\Wp.png"
}
var tImg = document.createElement("img")
var t0Img = document.createElement("img")
var carryHappeneing = 0
var carryobj = null
var originalSquare = null
var movecount = 0
var promoting = 0
var showlegal = 0
var squares = document.querySelectorAll('.square')
var wKing 
var bKing
var config = {}
var enpassant = null
var WkCastling = true  
var WqCastling = true
var BkCastling = true
var BqCastling = true


function octalToDeci(a,b){
    return parseInt(a+''+b,8)
}
function deciToOctal(a){
    if(a<8) return "0"+a.toString(8)
    return a.toString(8)
}

var formatedfen = function(){
    let fenHolder = startingfen.split("/")
    let finalfen = ""
    function splitnum(arr){
        for(let i = 0;i<8;i++){
            if(!isNaN(parseInt(arr[i]))){
                arr=splithe(arr,i)
            }
        }
        return arr
    }
    
    function splithe(arr,pos){
        if(arr[pos]==1)return arr
        let an = parseInt(arr.substr(pos,1))
        let adto = ""
        for(let i= 0;i<an;i++){
            adto=adto.concat("1")
        }
        arr= arr.replace(arr[pos],adto)
        return arr
    }
    for (let i = 0;i<fenHolder.length;i++){
        finalfen = finalfen.concat(splitnum(fenHolder[i])+"/")
    }
    finalfen = finalfen.slice(0,-1)
    return finalfen
}()
var boardsquares = function(){
    let notations = []
    let letters = "abcdefgh"
    for(let i = 1;i<=8;i++){
        for(let ii = 0;ii<8;ii++){
            let temporarystore = letters[ii]+i
            notations.push(temporarystore)
        }
    }
    return notations
}()
var positions = function(){
    let temporaryfen = formatedfen.split("/")
    temporaryfen.reverse()
    let temporaryobject = {}
    for(let i = 0;i<8;i++){
        for(let ii = 0;ii<8;ii++){
            if(temporaryfen[i][ii] != '1'){
                temporaryobject[boardsquares[parseInt(i+''+ii,8)]]=temporaryfen[i][ii]
            }
        }
    }
    return temporaryobject
}()







var createSquares = function(){
    for(let i = 0;i<8;i++){
        for(let ii = 0;ii<8;ii++){
            var square = document.createElement("div")
            square.classList.add("square")
            square.id = letters[ii]+(8-i)

            if(ii==0){
                var numeric = document.createElement("div")
                numeric.innerHTML = 8-i
                numeric.classList.add("numeric")
                numeric.classList.add("notation")
                square.appendChild(numeric)
                if((i+ii)%2==0){
                    numeric.classList.add('d')
                }else{
                    numeric.classList.add('l')
                }
            }
            if(i==7){
                var alpha = document.createElement("div")
                alpha.innerHTML = letters[ii]
                alpha.classList.add("alpha")
                alpha.classList.add("notation")
                if((i+ii)%2==0){
                    alpha.classList.add('d')
                }else{
                    alpha.classList.add('l')
                }
                square.appendChild(alpha)
            }

            if((i+ii)%2==0){
                square.classList.add('white')
            }else{
                square.classList.add('black')
            }



            document.getElementById("board").append(square)
        }
    }
}()




function isInSquare(e){
    let tiles = document.querySelectorAll('.square')
    let scrollTop = window.pageYOffset || document.documentElementscrollTop;
    let scrollLeft = window.pageXOffset || document.documentElementscrollLeft;
    if(!scrollTop)scrollTop = 0
    if(!scrollLeft)scrollLeft = 0
    for(let i = 0;i<64;i++){
            if(
                e.pageX >= tiles[i].getBoundingClientRect().left + scrollLeft &&
                e.pageX <= tiles[i].getBoundingClientRect().right + scrollLeft &&
                e.pageY >= tiles[i].getBoundingClientRect().top + scrollTop &&
                e.pageY <= tiles[i].getBoundingClientRect().bottom + scrollTop
            ){
                return tiles[i].id
            }
    }
}


var placePieces = function(){
    for(let i = 0;i<8;i++){
        for(let ii = 0;ii<8;ii++){
            let src = piecesrc[positions[boardsquares[parseInt(i+''+ii,8)]]]
            let num8 = 63-parseInt(i+""+ii,8)
            if(src){
                config[boardsquares[parseInt(i+''+ii,8)]] = src.slice(10,12)
            }else{
                config[boardsquares[parseInt(i+''+ii,8)]] = null
                continue
            }
            let newImg = document.createElement("img")
            newImg.src = src
            newImg.id = src.slice(10,12)+num8
            newImg.draggable = false
            if(src.slice(10,12) == 'Wk')wKing = src.slice(10,12)+num8
            if(src.slice(10,12) == 'Bk')bKing = src.slice(10,12)+num8

            newImg.onmousedown = function(e){
                if(promoting != 0)return
                if(movecount%2 == 0 && e.target.id.slice(0,1) == 'B')return
                if(movecount%2 != 0 && e.target.id.slice(0,1) == 'W')return
                carryobj = e.target.id
                originalSquare = e.target.parentNode.id
                e.target.parentNode.classList.add('over')
                carryHappeneing = 1
                e.target.style.opacity = 0.4

                generateDragImg(e,e.target.src)
            }


            newImg.classList.add("piece");
            document.getElementById(boardsquares[parseInt(i+''+ii,8)]).append(newImg)
        }
    }
}()

function createDuplicate(e,trackImg){
    document.body.appendChild(trackImg)
    
    trackImg.style.left = `${e.pageX-70/2}px`
    trackImg.style.top = `${e.pageY-70/2}px`

}

function generateDragImg(e,src){
    carryHappeneing = 1

    if(!t0Img)t0Img = document.createElement("img")
    if(!tImg)tImg = document.createElement("img")
    let currentSquare 
    let previousSquare
    tImg.draggable = false
    tImg.src = src
    tImg.id = "down"
    tImg.classList.add("float")
    tImg.style.left = `${e.pageX-70/2}px`
    tImg.style.top = `${e.pageY-70/2}px`
    document.body.appendChild(tImg)
    window.onmousemove = function(e){
        if(currentSquare && currentSquare != isInSquare(e))previousSquare = currentSquare
        if(previousSquare == isInSquare(e))previousSquare = null
        currentSquare = isInSquare(e)
        if(currentSquare && carryHappeneing==1){
            document.querySelector(`#${currentSquare}`).classList.add('over')
        }

        if(previousSquare && carryHappeneing==1)document.querySelector(`#${previousSquare}`).classList.remove('over')
        if(t0Img){
            if(tImg){
                document.body.removeChild(tImg)
                tImg = null
            }
            t0Img.src = src
            t0Img.draggable = false
            t0Img.classList.add("float")
            t0Img.style.left = `${e.pageX-70/2}px`
            t0Img.style.top = `${e.pageY-70/2}px`
            document.body.appendChild(t0Img)
            createDuplicate(e,t0Img)
        }
    }
}
function createimg(src,id){
    let img = document.createElement('img')
    img.src = src
    img.id = id
    img.draggable = false
    img.onmousedown = function(e){
        if(promoting != 0)return
        if(movecount%2 == 0 && e.target.id.slice(0,1) == 'B')return
        if(movecount%2 != 0 && e.target.id.slice(0,1) == 'W')return
        carryobj = e.target.id
        originalSquare = e.target.parentNode.id
        e.target.parentNode.classList.add('over')
        carryHappeneing = 1
        e.target.style.opacity = 0.4
        generateDragImg(e,e.target.src)
    }

    img.classList.add("piece");
    return img
}

function currentConifg(){
    let config = {}
    let squares = document.querySelectorAll('.square')

    for(let i = 0;i<squares.length;i++){
        if(squares[i].lastChild && squares[i].lastChild.tagName == 'IMG' ){
            config[squares[i].id] = squares[i].lastChild.id.slice(0,2)
        }
        else{
            config[squares[i].id] = null
        }
    }      
    return config
}
function possibleconfig(currentConn,original,target,piece,enpass){
    if(!piece)return
    let current = {...currentConn}
    current[original] = null
    current[target] = piece.slice(0,2)
    if(enpass){
        if(enpass.slice(1)==6){
            let ps = enpass.slice(0,1)+(parseInt(enpass.slice(1))-1)
            current[ps] = null
        }
        if(enpass.slice(1)==3){
            let ps = enpass.slice(0,1)+(parseInt(enpass.slice(1))+1)
            current[ps] = null
        }
    }
    return current
}

function promo(target){
    promoting = 1
    let div = document.createElement('div')
    div.id = 'choosePromo'
    let q = document.createElement('img')
    q.classList.add('promo')
    let r = document.createElement('img')
    r.classList.add('promo')
    let b = document.createElement('img')
    b.classList.add('promo')
    let n = document.createElement('img')
    n.classList.add('promo')

    if(target.slice(1)==8){
        div.style.top = 0
        q.src = piecesrc.Q
        q.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.Q,`Wq${movecount}`)
            carryobj = `Wq${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(q)
        r.src = piecesrc.R
        r.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.R,`Wr${movecount}`)
            carryobj = `Wr${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(r)
        b.src = piecesrc.B
        b.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.B,`Wb${movecount}`)
            carryobj = `Wb${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(b)
        n.src = piecesrc.N
        n.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.N,`Wn${movecount}`)
            carryobj = `Wn${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(n)
    }
    if(target.slice(1)==1){
        div.style.bottom = 0
        q.src = piecesrc.q
        q.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.q,`Bq${movecount}`)
            carryobj = `Bq${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(q)
        r.src = piecesrc.r
        r.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.r,`Br${movecount}`)
            carryobj = `Br${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(r)
        b.src = piecesrc.b
        b.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.b,`Bb${movecount}`)
            carryobj = `Bb${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(b)
        n.src = piecesrc.n
        n.onmousedown = function(e){
            document.getElementById(target).removeChild(document.getElementById('choosePromo'))
            let newimage = createimg(piecesrc.n,`Bn${movecount}`)
            carryobj = `Bn${movecount}`
            document.getElementById(target).appendChild(newimage)
            promoting = 0
            config = currentConifg()
        }
        div.appendChild(n)
    }
    document.getElementById(target).appendChild(div)
}

function CastlingRights_Ability(piece,origin,target){
    if(origin != target){        
        if(piece.slice(1,2) == 'k'){
            if(piece.slice(0,1) == 'W'){
                WkCastling = false
                WqCastling = false
            }
            if(piece.slice(0,1) == 'B'){
                WkCastling = false
                BqCastling = false
            }
        }
        if(piece.slice(1,2) == 'r'){
            if(origin.slice(0,1) == 'a'){
                if(piece.slice(0,1) == 'W'){
                    WqCastling = false
                }
                if(piece.slice(0,1) == 'B'){
                    BqCastling = false
                }
            }
            if(origin.slice(0,1) == 'h'){
                if(piece.slice(0,1) == 'W'){
                    WkCastling = false
                }
                if(piece.slice(0,1) == 'B'){
                    BkCastling = false
                }
            }
        }
    }
}

function canCastle(piece,side,config){
    let whiteleft = ['f1','g1']
    let blackleft = ['f8','g8']
    let whiteright = ['d1','c1','b1']
    let blackright = ['d8','c8','b8']
    if(piece == 'Wk'){
        if(side =='k' && WkCastling == true){
            for(let i = 0;i<whiteleft.length;i++){
                if((document.getElementById(whiteleft[i]).lastChild &&
                 document.getElementById(whiteleft[i]).lastChild.tagName == 'IMG') ||
                 Check(possibleconfig(config,'e1',whiteleft[i],'Wk'),'W') )return false
                 if(i == whiteleft.length-1)return true
            }
        }
        if(side =='q' && WqCastling == true){
            for(let i = 0;i<whiteright.length;i++){
                if((document.getElementById(whiteright[i]).lastChild &&
                 document.getElementById(whiteright[i]).lastChild.tagName == 'IMG') || 
                 (i < whiteright.length-1 && Check(possibleconfig(config,'e1',whiteright[i],'Wk'),'W')) )return false
                 if(i == whiteright.length-1)return true
            }
        }
    }
    if(piece == 'Bk'){
        if(side =='k' && BkCastling == true){
            for(let i = 0;i<blackleft.length;i++){
                if((document.getElementById(blackleft[i]).lastChild &&
                 document.getElementById(blackleft[i]).lastChild.tagName == 'IMG') ||
                 Check(possibleconfig(config,'e8',blackleft[i],'Bk'),'B') )return false
                 if(i == blackleft.length-1)return true
            }
        }
        if(side =='q' && BqCastling == true){
            for(let i = 0;i<blackright.length;i++){
                if((document.getElementById(blackright[i]).lastChild &&
                 document.getElementById(blackright[i]).lastChild.tagName == 'IMG') || 
                 (i < blackright.length-1 && Check(possibleconfig(config,'e8',blackright[i],'Bk'),'B')) )return false
                 if(i == blackright.length-1)return true
            }
        }

    }
    return false
}
var truly = 'wo'

window.onmouseup = function(e){
    carryHappeneing = 0
    let drop = 1
    let legality = 0
    let playerInChecked 
    let special = 0
    let checkingPiece 
    let checkingSquare
    let direction
    let possicon = possibleconfig(config,originalSquare,isInSquare(e),carryobj)
    if(carryobj && carryobj.slice(0,1) == 'W')playerInChecked = 'B'
    if(carryobj && carryobj.slice(0,1) == 'B')playerInChecked = 'W'


    // HANDLES CASTLIING OF THE KING 
    if(carryobj && carryobj.slice(1,2) == 'k'){
        if(carryobj.slice(0,1) == 'W'){
            if(letters.indexOf(originalSquare.slice(0,1)) == (letters.indexOf(isInSquare(e).slice(0,1))-2) && canCastle('Wk','k',config)){
                console.log('CASTLE')
                movecount++
                enpassant = null
                CastlingRights_Ability(carryobj,originalSquare,isInSquare(e))
                let newsrc = document.getElementById(carryobj).src
                let Crook = document.getElementById('h1').lastChild
                let Cking = document.getElementById('e1').lastChild
                document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
                document.getElementById('e1').removeChild(Cking)
                document.getElementById('h1').removeChild(Crook)
                document.getElementById('f1').appendChild(createimg(Crook.src,Crook.id))
                special = 1
                config = currentConifg()
            }
            if(letters.indexOf(originalSquare.slice(0,1)) == (letters.indexOf(isInSquare(e).slice(0,1))+2) && canCastle('Wk','q',config)){
                console.log('CASTLE')
                movecount++
                enpassant = null
                CastlingRights_Ability(carryobj,originalSquare,isInSquare(e))
                let newsrc = document.getElementById(carryobj).src
                let Crook = document.getElementById('a1').lastChild
                let Cking = document.getElementById('e1').lastChild
                document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
                document.getElementById('e1').removeChild(Cking)
                document.getElementById('a1').removeChild(Crook)
                document.getElementById('d1').appendChild(createimg(Crook.src,Crook.id))
                special = 1
                config = currentConifg()
            }
        }
        if(carryobj.slice(0,1) == 'B'){
            if(letters.indexOf(originalSquare.slice(0,1)) == (letters.indexOf(isInSquare(e).slice(0,1))-2) && canCastle('Bk','k',config)){
                console.log('CASTLE')
                movecount++
                enpassant = null
                CastlingRights_Ability(carryobj,originalSquare,isInSquare(e))
                let newsrc = document.getElementById(carryobj).src
                let Crook = document.getElementById('h8').lastChild
                let Cking = document.getElementById('e8').lastChild
                document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
                document.getElementById('e8').removeChild(Cking)
                document.getElementById('h8').removeChild(Crook)
                document.getElementById('f8').appendChild(createimg(Crook.src,Crook.id))
                special = 1
                config = currentConifg()
            }
            if(letters.indexOf(originalSquare.slice(0,1)) == (letters.indexOf(isInSquare(e).slice(0,1))+2) && canCastle('Bk','q',config)){
                console.log('CASTLE')
                movecount++
                enpassant = null
                CastlingRights_Ability(carryobj,originalSquare,isInSquare(e))
                let newsrc = document.getElementById(carryobj).src
                let Crook = document.getElementById('a8').lastChild
                let Cking = document.getElementById('e8').lastChild
                document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
                document.getElementById('e8').removeChild(Cking)
                document.getElementById('a8').removeChild(Crook)
                document.getElementById('d8').appendChild(createimg(Crook.src,Crook.id))
                special = 1
                config = currentConifg()
            }
        }
    }


    // HANDLES ENPASSANT OF PAWN
    if(enpassant && carryobj && carryobj.slice(1,2) == 'p'){
        if(carryobj.slice(0,1)=='W' && originalSquare.slice(1)==5 && 
        ((letters.indexOf(enpassant.slice(0,1))==letters.indexOf(originalSquare.slice(0,1))+1 &&
        enpassant.slice(0,1) != 'h') ||
        (letters.indexOf(enpassant.slice(0,1))==letters.indexOf(originalSquare.slice(0,1))-1 && 
        enpassant.slice(0,1) != 'a')) && isInSquare(e)==enpassant && 
        !Check(possibleconfig(config,originalSquare,isInSquare(e),carryobj,enpassant),carryobj.slice(0,1))){
            special = 1
            movecount++
            let king 
            if(carryobj.slice(0,1) == 'W')king = document.getElementById(wKing)
            if(carryobj.slice(0,1) == 'B')king = document.getElementById(bKing)
            king.classList.remove('inCheck')
            let newsrc = document.getElementById(carryobj).src

            document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
            document.getElementById(enpassant.slice(0,1)+(parseInt(enpassant.slice(1))-1)).removeChild(document.getElementById(enpassant.slice(0,1)+(parseInt(enpassant.slice(1))-1)).lastChild)
            document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))

            enpassant = null
        }

        if(carryobj.slice(0,1)=='B' && originalSquare.slice(1)==4 && 
        ((letters.indexOf(enpassant.slice(0,1))==letters.indexOf(originalSquare.slice(0,1))+1 &&
        enpassant.slice(0,1) != 'h') ||
        (letters.indexOf(enpassant.slice(0,1))==letters.indexOf(originalSquare.slice(0,1))-1 && 
        enpassant.slice(0,1) != 'a')) && isInSquare(e)==enpassant &&
        !Check(possibleconfig(config,originalSquare,isInSquare(e),carryobj,enpassant),carryobj.slice(0,1))){
            special = 1
            movecount++
            let king 
            if(carryobj.slice(0,1) == 'W')king = document.getElementById(wKing)
            if(carryobj.slice(0,1) == 'B')king = document.getElementById(bKing)
            king.classList.remove('inCheck')
            let newsrc = document.getElementById(carryobj).src

            document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
            document.getElementById(enpassant.slice(0,1)+(parseInt(enpassant.slice(1))+1)).removeChild(document.getElementById(enpassant.slice(0,1)+(parseInt(enpassant.slice(1))+1)).lastChild)
            document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
            
            enpassant = null
        }
    }



    // MAKES SURE THAT THE PLACE YOU ARE DROPPING ON DOESN'T CONTANIN A FRIENDLY PIECE
    if(isInSquare(e) &&
    document.getElementById(isInSquare(e)).lastChild && 
    document.getElementById(isInSquare(e)).lastChild.tagName == "IMG" &&
    carryobj &&
    (document.getElementById(isInSquare(e)).lastChild.id.slice(0,1) == carryobj.slice(0,1))) {
        drop = 0
    }


    // HANDLES THE DROPING OF PIECES UNDER NORMAL CIRCUMSTANCES
    if(originalSquare && isInSquare(e) && special == 0 && drop == 1 && islegal(config,originalSquare,isInSquare(e),carryobj) && !Check(possicon,carryobj.slice(0,1))){
        movecount++
        enpassant = null
        let king 
        if(carryobj.slice(0,1) == 'W')king = document.getElementById(wKing)
        if(carryobj.slice(0,1) == 'B')king = document.getElementById(bKing)
        king.classList.remove('inCheck')
        let newsrc = document.getElementById(carryobj).src
        
        CastlingRights_Ability(carryobj,originalSquare,isInSquare(e))

        if(carryobj.slice(0,2) == 'Wp' && isInSquare(e).slice(1) == 8){
            document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
            if(document.getElementById(isInSquare(e)).lastChild && 
            document.getElementById(isInSquare(e)).lastChild.tagName == 'IMG'){
                document.getElementById(isInSquare(e)).removeChild(document.getElementById(isInSquare(e)).lastChild)
            }

            promo(isInSquare(e))
            promoting = 1
        }else if(carryobj.slice(0,2) == 'Bp' && isInSquare(e).slice(1) == 1){
            document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
            if(document.getElementById(isInSquare(e)).lastChild && 
            document.getElementById(isInSquare(e)).lastChild.tagName == 'IMG'){
                document.getElementById(isInSquare(e)).removeChild(document.getElementById(isInSquare(e)).lastChild)
            }
            promo(isInSquare(e))
            promoting = 1
        }
        if(promoting == 0){
            if(document.getElementById(isInSquare(e)).lastChild && 
            (document.getElementById(isInSquare(e)).lastChild.tagName == "IMG") && 
            isInSquare(e)!=originalSquare){
                   document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
                   document.getElementById(isInSquare(e)).removeChild(document.getElementById(isInSquare(e)).lastChild)
                   document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
           }else{
                   document.getElementById(originalSquare).removeChild(document.getElementById(carryobj))
                   document.getElementById(isInSquare(e)).appendChild(createimg(newsrc,carryobj))
           }
           config = currentConifg()
   
           if(carryobj.slice(1,2) == 'p'){
               if(carryobj.slice(0,1) == 'W' && originalSquare.slice(1) == '2' && isInSquare(e).slice(1) == '4'){
                   enpassant = originalSquare.slice(0,1)+3
               }
               if(carryobj.slice(0,1) == 'B' && originalSquare.slice(1) == '7' && isInSquare(e).slice(1) == '5'){
                   enpassant = originalSquare.slice(0,1)+6
               }
           }
        }

    }


    let kingsquare = function(){
        let tempsquare = document.querySelectorAll('.square')
        for(let i = 0;i<64;i++){
            if(tempsquare[i].lastChild && tempsquare[i].lastChild.id.slice(0,2) == (playerInChecked+'k')){
                return tempsquare[i].id
            }
        }
    }()

    

    if(Check(config,playerInChecked)){
        Check(config,playerInChecked,'dooit')
        Checkmate(config,playerInChecked,kingsquare)
        let king 
        if(playerInChecked == 'W')king = document.getElementById(wKing)
        if(playerInChecked == 'B')king = document.getElementById(bKing)
        king.classList.add('inCheck')
    }

    let allSquare = document.querySelectorAll('.square')
    for(let i = 0;i<64;i++){
        allSquare[i].classList.remove('over')
    }
    let allImg = document.querySelectorAll(".piece")
    if(t0Img && document.body.contains(t0Img))document.body.removeChild(t0Img)
    if(tImg && document.body.contains(tImg))document.body.removeChild(tImg)
    tImg = null
    t0Img = null
    for(let i = 0;i<allImg.length;i++){
        allImg[i].style.opacity= 1
    }
    carryobj = null
    originalSquare = null
}



function colorSquare(e){
    if(e.target.tagName=="DIV" && !(e.target.classList.contains('notation'))){
        e.target.classList.add("over")
        return
    }
    e.target.parentNode.classList.add('over')
}


//-----------------------------------------------------------------------------------------------------------
function dis(n){
	let modn = n%8
	let divn = n/8

	let west = modn
	let east = 7-west
	let north = Math.floor(divn)
	let south = 7-north
	let northeast = Math.min(north,east)
	let northwest= Math.min(north, west )
	let southeast= Math.min(south, east )
	let southwest= Math.min(south, west )
	return [west,east,north,south, northwest, northeast,southwest,southeast]
}

function list(n){
	let west =[]
	let east = []
	let north =[]
	let south = []
	let northwest= []
	let northeast = []
	let southeast = []
	let southwest = []
	for(let i =1;i<=dis(n)[0];i++){
		west.push(n-i)
	}
	for(let i =1;i<=dis(n)[1];i++){
		east.push(n+i)
	}
	for(let i =1;i<=dis(n)[2];i++){
		north.push(n-(i*8))
	}
	for(let i =1;i<=dis(n)[3];i++){
		south.push(n+(i*8))
	}
	for(let i =1;i<=dis(n)[4];i++){
		northwest.push(n-(i*9))
	}
	for(let i =1;i<=dis(n)[5];i++){
		northeast.push(n-(i*7))
	}
	for(let i =1;i<=dis(n)[6];i++){
		southwest.push(n+(i*7))
	}
	for(let i =1;i<=dis(n)[7];i++){
		southeast.push(n+(i*9))
	}
	let tr = [west,east,north,south,northwest,northeast,southwest,southeast]
	return tr
}
var listOfMoves = function(){
    let tempolist = []
  for(let i=0;i<64;i++){
    
    tempolist.push(list(i))
  }
  return tempolist
}()



var objectofmovenotation = function(){
    let tempObject = {}
    for(let i = 0;i<64;i++){
        let tempoArray = []
        for(let ii = 0;ii<listOfMoves[i].length;ii++){
            let innerTempoArr = []
            for(let iii = 0;iii<listOfMoves[i][ii].length;iii++){
                innerTempoArr.push(boardsquares[listOfMoves[i][ii][iii]])
            }
            tempoArray.push(innerTempoArr)
        }
        tempObject[boardsquares[i]] = tempoArray
    }
    return tempObject
}()

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function islegal(config,originalPosition,targetPosition,id){
    if(pawn(config,originalPosition,targetPosition,id))return true
    if(knight(originalPosition,targetPosition,id))return true
    if(rook(config,originalPosition,targetPosition,id))return true
    if(bishop(config,originalPosition,targetPosition,id))return true
    if(queen(config,originalPosition,targetPosition,id))return true
    if(king(originalPosition,targetPosition,id))return true
    return false
}

function pawn(config,originalPosition,targetPosition,id){
    if(!originalPosition || !targetPosition || !id)return false
    let color = id.slice(0,1)
    let type = id.slice(1,2)
    if(type != 'p')return
    let forwardSquares
    let diaganalSquaresRight
    let diaganalSquaresLeft
    if(color == 'W'){
        forwardSquares = objectofmovenotation[originalPosition][3]
        diaganalSquaresRight = objectofmovenotation[originalPosition][7]
        diaganalSquaresLeft = objectofmovenotation[originalPosition][6]
    }
    if(color == 'B'){
        forwardSquares = objectofmovenotation[originalPosition][2]
        diaganalSquaresRight = objectofmovenotation[originalPosition][5]
        diaganalSquaresLeft = objectofmovenotation[originalPosition][4]
    }
    if(forwardSquares.length < 1) return false
    let firstmovecheck = function(){
        if(originalPosition.slice(1) == 2 && color == 'W')return 2
        if(originalPosition.slice(1) == 7 && color == 'B')return 2
        return 1
    }()
    for(let i = 0;i<firstmovecheck;i++){
        if(forwardSquares.indexOf(targetPosition) == -1)break
        if(config[targetPosition] != null)return false
        if(targetPosition == forwardSquares[i])return true
    }
    if(diaganalSquaresRight.length != 0 && 
        config[diaganalSquaresRight[0]] != null &&
        targetPosition == diaganalSquaresRight[0])return true
        if(diaganalSquaresLeft.length != 0 &&
            config[diaganalSquaresLeft[0]] != null  &&
        targetPosition == diaganalSquaresLeft[0])return true

        return false
}

function knight(originalPosition,targetPosition,id){
    if(!originalPosition || !targetPosition || !id)return false
    if(id.slice(1,2) != 'n')return false

    let originalRow = parseInt(originalPosition.slice(1))
    let originalColumn = parseInt(letters.indexOf(originalPosition.slice(0,1)))
    let targetRow = parseInt(targetPosition.slice(1))
    let targetColumn = parseInt(letters.indexOf(targetPosition.slice(0,1)))


    if(originalRow == targetRow+2 && originalColumn == targetColumn+1)return true
    if(originalRow == targetRow+2 && originalColumn == targetColumn-1)return true
    if(originalRow == targetRow+1 && originalColumn == targetColumn+2)return true
    if(originalRow == targetRow+1 && originalColumn == targetColumn-2)return true
    if(originalRow == targetRow-2 && originalColumn == targetColumn+1)return true
    if(originalRow == targetRow-2 && originalColumn == targetColumn-1)return true
    if(originalRow == targetRow-1 && originalColumn == targetColumn+2)return true
    if(originalRow == targetRow-1 && originalColumn == targetColumn-2)return true

    return false

}


function rook(config,originalPosition,targetPosition,id){
    if(!originalPosition || !targetPosition || !id)return false
    if(id.slice(1,2) != 'r')return false
    let forwardSquares = objectofmovenotation[originalPosition][3]
    let backwardSquares = objectofmovenotation[originalPosition][2]
    let rightSquares = objectofmovenotation[originalPosition][1]
    let leftSquares = objectofmovenotation[originalPosition][0]

    for(let i = 0;i<forwardSquares.length;i++){
        if(targetPosition == forwardSquares[i])return true
        if(forwardSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == forwardSquares[i]) && config[forwardSquares[i]] != null)return false
    }
    for(let i = 0;i<backwardSquares.length;i++){
        if(targetPosition == backwardSquares[i])return true
        if(backwardSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == backwardSquares[i]) && config[backwardSquares[i]] != null)return false
    }
    for(let i = 0;i<rightSquares.length;i++){
        if(targetPosition == rightSquares[i])return true
        if(rightSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == rightSquares[i]) && config[rightSquares[i]] != null)return false
    }
    for(let i = 0;i<leftSquares.length;i++){
        if(targetPosition == leftSquares[i])return true
        if(leftSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == leftSquares[i]) && config[leftSquares[i]] != null)return false
    }
    return false
}
function bishop(config,originalPosition,targetPosition,id){
    if(!originalPosition || !targetPosition || !id)return false
    if(id.slice(1,2) != 'b')return false
    let diagonalTopRight = objectofmovenotation[originalPosition][7]
    let diagonalTopLeft = objectofmovenotation[originalPosition][6]
    let diagonalBottomRight = objectofmovenotation[originalPosition][5]
    let diagonalBottomLeft = objectofmovenotation[originalPosition][4]

    for(let i = 0;i<diagonalTopRight.length;i++){
        if(targetPosition == diagonalTopRight[i])return true
        if(diagonalTopRight.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalTopRight[i]) && config[diagonalTopRight[i]] != null)return false
    }
    for(let i = 0;i<diagonalTopLeft.length;i++){
        if(targetPosition == diagonalTopLeft[i])return true
        if(diagonalTopLeft.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalTopLeft[i]) && config[diagonalTopLeft[i]] != null)return false
    }
    for(let i = 0;i<diagonalBottomRight.length;i++){
        if(targetPosition == diagonalBottomRight[i])return true
        if(diagonalBottomRight.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalBottomRight[i]) && config[diagonalBottomRight[i]] != null)return false
    }
    for(let i = 0;i<diagonalBottomLeft.length;i++){
        if(targetPosition == diagonalBottomLeft[i])return true
        if(diagonalBottomLeft.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalBottomLeft[i]) && config[diagonalBottomLeft[i]] != null)return false
    }
    return false
}
function queen(config,originalPosition,targetPosition,id){
    if(!originalPosition || !targetPosition || !id)return false
    if(id.slice(1,2) != 'q')return false
    let forwardSquares = objectofmovenotation[originalPosition][3]
    let backwardSquares = objectofmovenotation[originalPosition][2]
    let rightSquares = objectofmovenotation[originalPosition][1]
    let leftSquares = objectofmovenotation[originalPosition][0]
    let diagonalTopRight = objectofmovenotation[originalPosition][7]
    let diagonalTopLeft = objectofmovenotation[originalPosition][6]
    let diagonalBottomRight = objectofmovenotation[originalPosition][5]
    let diagonalBottomLeft = objectofmovenotation[originalPosition][4]

    for(let i = 0;i<forwardSquares.length;i++){
        if(targetPosition == forwardSquares[i])return true
        if(forwardSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == forwardSquares[i]) && config[forwardSquares[i]] != null)return false
    }
    for(let i = 0;i<backwardSquares.length;i++){
        if(targetPosition == backwardSquares[i])return true
        if(backwardSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == backwardSquares[i]) && config[backwardSquares[i]] != null)return false
    }
    for(let i = 0;i<rightSquares.length;i++){
        if(targetPosition == rightSquares[i])return true
        if(rightSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == rightSquares[i]) && config[rightSquares[i]] != null)return false
    }
    for(let i = 0;i<leftSquares.length;i++){
        if(targetPosition == leftSquares[i])return true
        if(leftSquares.indexOf(targetPosition) != -1 &&
        !(targetPosition == leftSquares[i]) && config[leftSquares[i]] != null)return false
    }
    for(let i = 0;i<diagonalTopRight.length;i++){
        if(targetPosition == diagonalTopRight[i])return true
        if(diagonalTopRight.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalTopRight[i]) && config[diagonalTopRight[i]] != null)return false
    }
    for(let i = 0;i<diagonalTopLeft.length;i++){
        if(targetPosition == diagonalTopLeft[i])return true
        if(diagonalTopLeft.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalTopLeft[i]) && config[diagonalTopLeft[i]] != null)return false
    }
    for(let i = 0;i<diagonalBottomRight.length;i++){
        if(targetPosition == diagonalBottomRight[i])return true
        if(diagonalBottomRight.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalBottomRight[i]) && config[diagonalBottomRight[i]] != null)return false
    }
    for(let i = 0;i<diagonalBottomLeft.length;i++){
        if(targetPosition == diagonalBottomLeft[i])return true
        if(diagonalBottomLeft.indexOf(targetPosition) != -1 &&
        !(targetPosition == diagonalBottomLeft[i]) && config[diagonalBottomLeft[i]] != null)return false
    }


    return false
}

function king(originalPosition,targetPosition,id,strpos){
    if(!originalPosition || !targetPosition || !id)return false
    if(id.slice(1,2) != 'k')return false
    let forwardSquares = objectofmovenotation[originalPosition][3][0]
    let backwardSquares = objectofmovenotation[originalPosition][2][0]
    let rightSquares = objectofmovenotation[originalPosition][1][0]
    let leftSquares = objectofmovenotation[originalPosition][0][0]
    let diagonalTopRight = objectofmovenotation[originalPosition][7][0]
    let diagonalTopLeft = objectofmovenotation[originalPosition][6][0]
    let diagonalBottomRight = objectofmovenotation[originalPosition][5][0]
    let diagonalBottomLeft = objectofmovenotation[originalPosition][4][0]


    if(targetPosition == forwardSquares)return true
    if(targetPosition == backwardSquares)return true
    if(targetPosition == rightSquares)return true
    if(targetPosition == leftSquares)return true
    if(targetPosition == diagonalTopRight)return true
    if(targetPosition == diagonalTopLeft)return true
    if(targetPosition == diagonalBottomRight)return true
    if(targetPosition == diagonalBottomLeft)return true
    
    return false
}


function toNotation(column,row){
    column = letters[column-1]
    row = row
    return column+row
}

function Check(configuration,player,strpos){

    if(!player)return

    let origin
    

        for(s in configuration){
            if(player == 'W' && configuration[s]=='Wk'){
                origin = s
            }
            if(player == 'B' && configuration[s]=='Bk'){
                origin = s
            }
        }

    let forwardSquares = objectofmovenotation[origin][3]
    let backwardSquares = objectofmovenotation[origin][2]
    let rightSquares = objectofmovenotation[origin][1]
    let leftSquares = objectofmovenotation[origin][0]
    let diagonalTopRight = objectofmovenotation[origin][7]
    let diagonalTopLeft = objectofmovenotation[origin][6]
    let diagonalBottomRight = objectofmovenotation[origin][5]
    let diagonalBottomLeft = objectofmovenotation[origin][4]


    let originRow = parseInt(origin.slice(1))
    let originColumn = parseInt(letters.indexOf(origin.slice(0,1)))+1

    let knightSquares = [[2,1],[2,-1],[1,2],[1,-2],[-2,1],[-2,-1],[-1,2],[-1,-2]]

    for(let i = 0;i<knightSquares.length;i++){
        let targetRow = originRow+knightSquares[i][0]
        let targetColumn = originColumn+knightSquares[i][1]
        let posi = toNotation(targetColumn,targetRow)

        
        if(configuration[posi] && 
            configuration[posi].slice(0,1) != player &&
            configuration[posi].slice(1,2) == 'n'){
                if(!strpos){
                    checkingPiece = configuration[posi]
                    checkingSquare =  posi
                }
                // console.log(posi,'wwwww',configuration[posi])
                return true
            }
    }

    for(poss in forwardSquares){
        if(configuration[forwardSquares[poss]] &&
            (configuration[forwardSquares[poss]].slice(0,1) == player ||
            configuration[forwardSquares[poss]].slice(1,2) == 'p' ||
            configuration[forwardSquares[poss]].slice(1,2) == 'n' ||
            configuration[forwardSquares[poss]].slice(1,2) == 'b'))break
        
        if(configuration[forwardSquares[0]] && configuration[forwardSquares[0]].slice(1,2) == 'k'){
                // checkingPiece = {forwardSquares[i]:configuration[forwardSquares[i]]}
                if(!strpos){
                    checkingPiece = configuration[forwardSquares[0]]
                    checkingSquare =  forwardSquares[0]
                    direction = 'forwardSquares'
                }
                // console.log(configuration[forwardSquares[0]],'forward1',forwardSquares[0])
                return true
            }

        if(configuration[forwardSquares[poss]] && 
            (configuration[forwardSquares[poss]].slice(1,2) == 'q' || 
            configuration[forwardSquares[poss]].slice(1,2) == 'r')){
                if(!strpos){
                    checkingPiece = configuration[forwardSquares[poss]]
                    checkingSquare = forwardSquares[poss]
                    direction = 'forwardSquares'
                }
                // console.log(configuration[forwardSquares[poss]],'forward',forwardSquares[poss])
                return true
            }
    }

    for(poss in backwardSquares){
        if(configuration[backwardSquares[poss]] &&
            (configuration[backwardSquares[poss]].slice(0,1) == player ||
            configuration[backwardSquares[poss]].slice(1,2) == 'p' ||
            configuration[backwardSquares[poss]].slice(1,2) == 'n' ||
            configuration[backwardSquares[poss]].slice(1,2) == 'b'))break
        
        if(configuration[backwardSquares[0]] && configuration[backwardSquares[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[backwardSquares[poss]]
                checkingSquare = backwardSquares[poss]
                direction = 'backwardSquares'
            }
            // console.log(configuration[backwardSquares[0]],'backward1',backwardSquares[0])
            return true
        }

        if(configuration[backwardSquares[poss]] && 
            (configuration[backwardSquares[poss]].slice(1,2) == 'q' || 
            configuration[backwardSquares[poss]].slice(1,2) == 'r')){
                if(!strpos){
                    checkingPiece = configuration[backwardSquares[poss]]
                    checkingSquare = backwardSquares[poss]
                    direction = 'backwardSquares'
                }
                // console.log(configuration[backwardSquares[poss]],'backward',backwardSquares[poss])
                return true
            }
    }

    for(poss in rightSquares){
        if(configuration[rightSquares[poss]] &&
            (configuration[rightSquares[poss]].slice(0,1) == player ||
            configuration[rightSquares[poss]].slice(1,2) == 'p' ||
            configuration[rightSquares[poss]].slice(1,2) == 'n' ||
            configuration[rightSquares[poss]].slice(1,2) == 'b'))break
        
        if(configuration[rightSquares[0]] && configuration[rightSquares[0]].slice(1,2) == 'k'){
            if(!strpos){
                checkingPiece = configuration[rightSquares[poss]]
                checkingSquare = rightSquares[poss]
                direction = 'rightSquares'
            }
                // console.log(configuration[rightSquares[poss]],'right1',rightSquares[poss])
                return true
        }

        if(configuration[rightSquares[poss]] && 
            (configuration[rightSquares[poss]].slice(1,2) == 'q' || 
            configuration[rightSquares[poss]].slice(1,2) == 'r')){
                if(!strpos){
                    checkingPiece = configuration[rightSquares[poss]]
                    checkingSquare = rightSquares[poss]
                    direction = 'rightSquares'
                }
                // console.log(configuration[rightSquares[poss]],'right',rightSquares[poss])
                return true
            }
    }

    for(poss in leftSquares){
        if(configuration[leftSquares[poss]] &&
            (configuration[leftSquares[poss]].slice(0,1) == player ||
            configuration[leftSquares[poss]].slice(1,2) == 'p' ||
            configuration[leftSquares[poss]].slice(1,2) == 'n' ||
            configuration[leftSquares[poss]].slice(1,2) == 'b'))break
        
        if(configuration[leftSquares[0]] && configuration[leftSquares[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[leftSquares[poss]]
                checkingSquare = leftSquares[poss]
                direction = 'leftSquares'
            }
            // console.log(configuration[leftSquares[poss]],'left1',leftSquares[poss])
            return true
        }

        if(configuration[leftSquares[poss]] && 
            (configuration[leftSquares[poss]].slice(1,2) == 'q' || 
            configuration[leftSquares[poss]].slice(1,2) == 'r')){
                if(!strpos){
                    checkingPiece = configuration[leftSquares[poss]]
                    checkingSquare = leftSquares[poss]
                    direction = 'leftSquares'
                }
                // console.log(configuration[leftSquares[poss]],'left1',leftSquares[poss])    
                return true
            }
    }

    for(poss in diagonalTopRight){
        if(configuration[diagonalTopRight[poss]] &&
            (configuration[diagonalTopRight[poss]].slice(0,1) == player ||
            configuration[diagonalTopRight[poss]].slice(1,2) == 'n' ||
            configuration[diagonalTopRight[poss]].slice(1,2) == 'r'))break
        
        if(configuration[diagonalTopRight[0]] && configuration[diagonalTopRight[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[diagonalTopRight[poss]]
                checkingSquare = diagonalTopRight[poss]
                direction = 'diagonalTopRight'
            }
            // console.log(configuration[diagonalTopRight[poss]],'topright1',diagonalTopRight[poss])
            return true
        }

        if(configuration[diagonalTopRight[0]] && 
            configuration[diagonalTopRight[0]].slice(0,1) != player &&
            configuration[diagonalTopRight[0]].slice(0,1) != 'W' &&
            configuration[diagonalTopRight[0]].slice(1,2) == 'p'){
                if(!strpos){
                    checkingPiece = configuration[diagonalTopRight[poss]]
                    checkingSquare = diagonalTopRight[poss]
                    direction = 'diagonalTopRight'
                }
                // console.log(configuration[diagonalTopRight[poss]],'toprightpp',diagonalTopRight[poss])
                return true
            }

        if(configuration[diagonalTopRight[poss]] && 
            (configuration[diagonalTopRight[poss]].slice(1,2) == 'q' || 
            configuration[diagonalTopRight[poss]].slice(1,2) == 'b')){
                if(!strpos){
                    checkingPiece = configuration[diagonalTopRight[poss]]
                    checkingSquare = diagonalTopRight[poss]
                    direction = 'diagonalTopRight'
                }
                // console.log(configuration[diagonalTopRight[poss]],'topright',diagonalTopRight[poss])
                return true
            }
    }

    for(poss in diagonalTopLeft){
        if(configuration[diagonalTopLeft[poss]] &&
            (configuration[diagonalTopLeft[poss]].slice(0,1) == player ||
            configuration[diagonalTopLeft[poss]].slice(1,2) == 'n' ||
            configuration[diagonalTopLeft[poss]].slice(1,2) == 'r'))break
        
        if(configuration[diagonalTopLeft[0]] && configuration[diagonalTopLeft[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[diagonalTopLeft[poss]]
                checkingSquare = diagonalTopLeft[poss]
                direction = 'diagonalTopLeft'
            }
            // console.log(configuration[diagonalTopLeft[poss]],'topleft1',diagonalTopLeft[poss])
            return true
        }

        if(configuration[diagonalTopLeft[0]] && 
            configuration[diagonalTopLeft[0]].slice(0,1) != player &&
            configuration[diagonalTopLeft[0]].slice(0,1) != 'W' &&
            configuration[diagonalTopLeft[0]].slice(1,2) == 'p'){
                if(!strpos){
                    checkingPiece = configuration[diagonalTopLeft[poss]]
                    checkingSquare = diagonalTopLeft[poss]
                    direction = 'diagonalTopLeft'
                }
                // console.log(configuration[diagonalTopLeft[poss]],'topleftpp',diagonalTopLeft[poss])
                return true
            }

        if(configuration[diagonalTopLeft[poss]] && 
            (configuration[diagonalTopLeft[poss]].slice(1,2) == 'q' || 
            configuration[diagonalTopLeft[poss]].slice(1,2) == 'b')){
                if(!strpos){
                    checkingPiece = configuration[diagonalTopLeft[poss]]
                    checkingSquare = diagonalTopLeft[poss]
                    direction = 'diagonalTopLeft'
                }
                // console.log(configuration[diagonalTopLeft[poss]],'topleft',diagonalTopLeft[poss])
                return true
            }
    }

    for(poss in diagonalBottomRight){
        if(configuration[diagonalBottomRight[poss]] &&
            (configuration[diagonalBottomRight[poss]].slice(0,1) == player ||
            configuration[diagonalBottomRight[poss]].slice(1,2) == 'n' ||
            configuration[diagonalBottomRight[poss]].slice(1,2) == 'r'))break
        
        if(configuration[diagonalBottomRight[0]] && configuration[diagonalBottomRight[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[diagonalBottomRight[poss]]
                checkingSquare = diagonalBottomRight[poss]
                direction = 'diagonalBottomRight'

            }
            // console.log(configuration[diagonalBottomRight[poss]],'bottomright1',diagonalBottomRight[poss])
            return true
        }

        if(configuration[diagonalBottomRight[0]] && 
            configuration[diagonalBottomRight[0]].slice(0,1) != player &&
            configuration[diagonalBottomRight[0]].slice(0,1) != 'B' &&
            configuration[diagonalBottomRight[0]].slice(1,2) == 'p'){
                if(!strpos){
                    checkingPiece = configuration[diagonalBottomRight[poss]]
                    checkingSquare = diagonalBottomRight[poss]
                    direction = 'diagonalBottomRight'
                }
                // console.log(configuration[diagonalBottomRight[poss]],'bottomrightpp',diagonalBottomRight[poss])
                return true
            }
        

        if(configuration[diagonalBottomRight[poss]] && 
            (configuration[diagonalBottomRight[poss]].slice(1,2) == 'q' || 
            configuration[diagonalBottomRight[poss]].slice(1,2) == 'b')){
                if(!strpos){
                    checkingPiece = configuration[diagonalBottomRight[poss]]
                    checkingSquare = diagonalBottomRight[poss]
                    direction = 'diagonalBottomRight'
                }
                // console.log(configuration[diagonalBottomRight[poss]],'bottomright',diagonalBottomRight[poss])
                return true
            }
    }

    for(poss in diagonalBottomLeft){
        if(configuration[diagonalBottomLeft[poss]] &&
            (configuration[diagonalBottomLeft[poss]].slice(0,1) == player ||
            configuration[diagonalBottomLeft[poss]].slice(1,2) == 'n' ||
            configuration[diagonalBottomLeft[poss]].slice(1,2) == 'r'))break
        
        if(configuration[diagonalBottomLeft[0]] && configuration[diagonalBottomLeft[0]].slice(1,2) == 'k') {
            if(!strpos){
                checkingPiece = configuration[diagonalBottomLeft[poss]]
                checkingSquare = diagonalBottomLeft[poss]
                direction = 'diagonalBottomLeft'
            }
            // console.log(configuration[diagonalBottomLeft[poss]],'bottomleft1',diagonalBottomLeft[poss])
            return true
        }

        if(configuration[diagonalBottomLeft[0]] && 
            configuration[diagonalBottomLeft[0]].slice(0,1) != player &&
            configuration[diagonalBottomLeft[0]].slice(0,1) != 'B' &&
            configuration[diagonalBottomLeft[0]].slice(1,2) == 'p'){
                if(!strpos){
                    checkingPiece = configuration[diagonalBottomLeft[poss]]
                    checkingSquare = diagonalBottomLeft[poss]
                    direction = 'diagonalBottomLeft'
                }
                // console.log(configuration[diagonalBottomLeft[poss]],'bottomleftpp',diagonalBottomLeft[poss])
                return true
            }

        if(configuration[diagonalBottomLeft[poss]] && 
            (configuration[diagonalBottomLeft[poss]].slice(1,2) == 'q' || 
            configuration[diagonalBottomLeft[poss]].slice(1,2) == 'b')){
                if(!strpos){
                    checkingPiece = configuration[diagonalBottomLeft[poss]]
                    checkingSquare = diagonalBottomLeft[poss]
                    direction = 'diagonalBottomLeft'
                }
                // console.log(configuration[diagonalBottomLeft[poss]],'bottomleft',diagonalBottomLeft[poss])
                return true
            }
    }


    return false

    
}

function Checkmate(configuration,player,kingsquare){
    console.log(checkingPiece,'just fine',checkingSquare,direction)
    console.log(player)
    if(!player)return

    let origin = kingsquare
    
    
    let availableKingSquares = {
        forwardSquares : objectofmovenotation[origin][3][0],
        backwardSquares : objectofmovenotation[origin][2][0],
        rightSquares : objectofmovenotation[origin][1][0],
        leftSquares : objectofmovenotation[origin][0][0],
        diagonalTopRight : objectofmovenotation[origin][7][0],
        diagonalTopLeft : objectofmovenotation[origin][6][0],
        diagonalBottomRight : objectofmovenotation[origin][5][0],
        diagonalBottomLeft : objectofmovenotation[origin][4][0]
    }

    console.log(availableKingSquares[direction],'llllllll')

    let capturingSquare = {
        forwardSquares : objectofmovenotation[checkingSquare][3],
        backwardSquares : objectofmovenotation[checkingSquare][2],
        rightSquares : objectofmovenotation[checkingSquare][1],
        leftSquares : objectofmovenotation[checkingSquare][0],
        diagonalTopRight : objectofmovenotation[checkingSquare][7],
        diagonalTopLeft : objectofmovenotation[checkingSquare][6],
        diagonalBottomRight : objectofmovenotation[checkingSquare][5],
        diagonalBottomLeft : objectofmovenotation[checkingSquare][4]
    }


    //can you escape the check
    for(squares in availableKingSquares){
        if(!availableKingSquares[squares])continue

        if(!Check(possibleconfig(configuration,origin,availableKingSquares[squares],(player+'k')),player)){
            if(configuration[availableKingSquares[squares]] == null || configuration[availableKingSquares[squares]].slice(0,1) != player ){
                console.log('WOWOWOWOW',availableKingSquares[squares],player)
                // return true
                break
            }
        }
    }

    //can you capture the attacking piece
     for(i in capturingSquare){
        for(ii in capturingSquare[i]){
            if(i == 'forwardSquares'){
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'r')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }

            if(i == 'backwardSquares'){
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'r')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'rightSquares'){
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'r')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'leftSquares'){
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'r')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'diagonalTopRight'){
                if(player == 'B' && configuration[capturingSquare[i][0]] == 'Bp'){
                    if(!Check(possibleconfig(config,capturingSquare[i][0],checkingSquare,configuration[capturingSquare[i][0]]),configuration[capturingSquare[i][0]].slice(0,1))){
                        console.log('killed by a pawn',configuration[capturingSquare[i][0]],capturingSquare[i][0])
                    }
                }
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'b')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'diagonalTopLeft'){
                if(player == 'B' && configuration[capturingSquare[i][0]] == 'Bp'){
                    if(!Check(possibleconfig(config,capturingSquare[i][0],checkingSquare,configuration[capturingSquare[i][0]]),configuration[capturingSquare[i][0]].slice(0,1))){
                        console.log('killed by a pawn',configuration[capturingSquare[i][0]],capturingSquare[i][0])
                    }
                }
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'b')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'diagonalBottomRight'){
                if(player == 'W' && configuration[capturingSquare[i][0]] == 'Wp'){
                    if(!Check(possibleconfig(config,capturingSquare[i][0],checkingSquare,configuration[capturingSquare[i][0]]),configuration[capturingSquare[i][0]].slice(0,1))){
                        console.log('killed by a pawn',configuration[capturingSquare[i][0]],capturingSquare[i][0])
                    }
                }
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'b')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
            if(i == 'diagonalBottomLeft'){
                if(player == 'W' && configuration[capturingSquare[i][0]] == 'Wp'){
                    if(!Check(possibleconfig(config,capturingSquare[i][0],checkingSquare,configuration[capturingSquare[i][0]]),configuration[capturingSquare[i][0]].slice(0,1))){
                        console.log('killed by a pawn',configuration[capturingSquare[i][0]],capturingSquare[i][0])
                    }
                }
                if(configuration[capturingSquare[i][ii]] == (player+'q') ||
                configuration[capturingSquare[i][ii]] == (player+'b')){
                    if(!Check(possibleconfig(config,capturingSquare[i][ii],checkingSquare,configuration[capturingSquare[i][ii]]),configuration[capturingSquare[i][ii]].slice(0,1))){
                        console.log('not today motherfucker',configuration[capturingSquare[i][ii]],capturingSquare[i][ii])
                        break
                    }
                }
            }
        

        }
     }


     //can you block the check
         
    let kingToAttacker = {
        forwardSquares : objectofmovenotation[origin][3],
        backwardSquares : objectofmovenotation[origin][2],
        rightSquares : objectofmovenotation[origin][1],
        leftSquares : objectofmovenotation[origin][0],
        diagonalTopRight : objectofmovenotation[origin][7],
        diagonalTopLeft : objectofmovenotation[origin][6],
        diagonalBottomRight : objectofmovenotation[origin][5],
        diagonalBottomLeft : objectofmovenotation[origin][4]
    }

    

    for(i in kingToAttacker[direction]){
        if(kingToAttacker[direction][i] == checkingSquare)break
        console.log('yoyoyouiui',kingToAttacker[direction][i])
        
        let originRow = parseInt(kingToAttacker[direction][i].slice(1))
        let originColumn = parseInt(letters.indexOf(kingToAttacker[direction][i].slice(0,1)))+1

        let knightSquares = [[2,1],[2,-1],[1,2],[1,-2],[-2,1],[-2,-1],[-1,2],[-1,-2]]

        for(let ii = 0;ii<knightSquares.length;ii++){
            let targetRow = originRow+knightSquares[ii][0]
            let targetColumn = originColumn+knightSquares[ii][1]
            let posi = toNotation(targetColumn,targetRow)

            
            if(configuration[posi] == (player+'n')){
                    if(!Check(possibleconfig(config,posi,kingToAttacker[direction][i],(player+'n')),player)){
                        console.log('knigt',player+'n',kingToAttacker[direction][i],posi)
                    }
            }
        }

            for(let ii = 0;ii<objectofmovenotation[kingToAttacker[direction][i]][3].length;ii++){
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]] == (player+'r'))){
                    console.log('forward')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][3][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww','fore')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][2][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][2][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][2][ii]] == (player+'r'))){
                    console.log('back')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][2][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww','back')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][1][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][1][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][1][ii]] == (player+'r'))){
                    console.log('right')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][1][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww','righ')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][0][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][0][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][0][ii]] == (player+'r'))){
                    console.log('left')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][0][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww','left')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][7][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][7][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][7][ii]] == (player+'b'))){
                    console.log('topright')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][7][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww',"toprigh")
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][6][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][6][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][6][ii]] == (player+'b'))){
                    console.log('topleft')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][6][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][3][ii]]))){
                        console.log('nowwwwwww','topleft')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][5][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][5][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][5][ii]] == (player+'b'))){
                    console.log('bottomright')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][5][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][5][ii]]))){
                        console.log('nowwwwwww','bottomright')
                    }
                }
                if(configuration[objectofmovenotation[kingToAttacker[direction][i]][4][ii]] != null && 
                    (configuration[objectofmovenotation[kingToAttacker[direction][i]][4][ii]] == (player+'q') ||
                configuration[objectofmovenotation[kingToAttacker[direction][i]][4][ii]] == (player+'b'))){
                    console.log('bottomleft')
                    if(!Check(possibleconfig(config,kingToAttacker[direction][i],objectofmovenotation[kingToAttacker[direction][i]][4][ii],configuration[objectofmovenotation[kingToAttacker[direction][i]][4][ii]]))){
                        console.log('nowwwwwww','bottomleft')
                    }
                }

            }

    }

}
