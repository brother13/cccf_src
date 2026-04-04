var url = 'ws://127.0.0.1:22225'
var websocket
var connected = false

var openFlagA = false
var isOpenMainCamera = false
var MainCanvas
var MainContext
var pMainShowStartX = 0
var pMainShowStartY = 0
var isMouseDown = false
var pALastX = 0
var pALastY = 0
var pACurrentX = 0
var pACurrentY = 0
var MainCamCutMode = 0

var isOpenAssistCamera = false
var AssistCanvas
var AssistContext
var pAssistShowStartX
var pAssistShowStartY

var func_scan_callback = null

export function releaseSocketPro() {
  var data = JSON.stringify({ 'function': 'releaseSocketPro' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

window.onbeforeunload = function() {
//    Cam_Close();  //关闭摄像头

  //    try {
  //        releaseSocketPro();   //>>>>>>>>>>>>>>>>.修改的地方>>>>>>>>>>>>>>>
  //        websocket.close();
  //        socket = null;
  //    }
  //    catch (ex) {
  //    }
  Cam_Close() // 关闭摄像头
  console.log('onbeforeunload')
  releaseSocketPro()
  try {
    websocket.close()
    websocket = null
  } catch (ex) {
  }
}

export function GetDocument(id) {
  return document.getElementById(id)
}

export function toSleep(milliSeconds) {
  var startTime = new Date().getTime()
  while (new Date().getTime() < startTime + milliSeconds);
}

export function addEvent(obj, xEvent, fn) {
  if (obj.attachEvent) {
    obj.attachEvent('on' + xEvent, fn)
  } else {
    obj.addEventListener(xEvent, fn, false)
  }
}

export function InitCanvas(DivMainBox, mX, mY, mwidth, mheight) {
  if (mwidth != 0 && mheight != 0) {
    MainCanvas = document.createElement('canvas')
    MainCanvas.style.border = 'solid 1px #A0A0A0'
    MainCanvas.id = 'MainCamCanvas'
    MainCanvas.width = mwidth
    MainCanvas.height = mheight
    MainContext = MainCanvas.getContext('2d')
    DivMainBox.appendChild(MainCanvas) // 添加画布
    MainCanvas.onmousedown = MainCanvasMouseDown
    MainCanvas.onmousemove = MainCanvasMouseMove
    MainCanvas.onmouseup = MainCanvasMouseUp
    MainCanvas.onmouseout = MainCanvasMouseOut
    addEvent(MainCanvas, 'mousewheel', onMouseWheel)
    addEvent(MainCanvas, 'DOMMouseScroll', onMouseWheel)
  }
}

export function InitCanvas2(DivMainBox, mX, mY, mwidth, mheight) {
  if (mwidth != 0 && mheight != 0) {
    AssistCanvas = document.createElement('canvas')
    AssistCanvas.style.border = 'solid 1px #A0A0A0'
    AssistCanvas.id = 'AssistCamCanvas'
    AssistCanvas.width = mwidth
    AssistCanvas.height = mheight
    AssistContext = AssistCanvas.getContext('2d')
    DivMainBox.appendChild(AssistCanvas) // 添加画布
  }
}

//* ************摄像头操作初始化***************
export function Cam_ControlInit(documentObj, mX, mY, mwidth, mheight, callback) {
  if (callback) {
    func_scan_callback = callback
    console.log('func_scan_callback', func_scan_callback)
  }

  ConnectServer(sendMessage, '') // 连接服务器
  InitCanvas(documentObj, mX, mY, mwidth, mheight)
  console.log('InitCanvas ok')
}

export function Cam_ControlInit2(documentObj, mX, mY, mwidth, mheight) {
  InitCanvas2(documentObj, mX, mY, mwidth, mheight)
  console.log('InitCanvas ok2')
}

// >>>>>>>>>>>>>>>>.修改的地方>>>>>>>>>>>>>>>
var lockReconnect = false
var connectCount = 0
var heartTimerId = -1

// 心跳检测
export function heartCheck() {
  clearInterval(heartTimerId)
  heartTimerId = setInterval(function() {
    if (isSocketConnect) {
      Heartbeat()
    }
  }, 6000)
}

// //掉线重连
// var intervalId = -1;
// function reconnect() {

//    clearInterval(intervalId);
//    intervalId = setInterval(function () {
//        if (connected == false) {
//            Heartbeat();
//            console.log("reconnect...")
//        }
//        console.log("reconnectTimer.........!")
//    }, 3000);
// }

/**
* 初始化webSocket连接
* @param callback
* @param value
* @constructor
*/
export function ConnectServer(callback, value) {
  // 建立连接
  websocket = new WebSocket(url)

  console.log('websocket', websocket)

  websocket.onopen = function(e) {
    connected = true
    console.log('onopen sucess')
    Cam_GetDevCount()
  }
  websocket.onclose = function(e) {
    connected = false
    // reconnect();
    console.log('onclose')
    try {
      websocket.close()
      websocket = null
    } catch (ex) {
    }
  }
  websocket.onmessage = function(e) {
    // console.log("onmessage",e);
    onMessage(e)
  }
  websocket.onerror = function(e) {
    // reconnect();
    try {
      websocket.close()
      websocket = null
    } catch (ex) {
    }
    console.log('未连接高拍仪服务，请确保已运行服务端！!!!')
  }
}

/**
* 接收服务器消息
* @param e
*/
export function onMessage(e) {
  console.log('onMessage', e)
  var Obj = JSON.parse(e.data.replace(/[\r\n]/g, ''))
  // 通用回调处理函数 jsonObj
  // var jsonObj=Utf8ToUnicode(Obj);
  cameraProduceMessage(Obj)
  if (func_scan_callback) {
    func_scan_callback(Obj)
  }
}

/**
* 向服务器发送信息的共享方法
* @param jsonStr
*/
export function sendMessage(jsonStr) {
  connected ? websocket.send(jsonStr) : alert('未连接websocket服务器，请确保已运行服务端！')
}

/** ***************************************************************************************************************/
export function cameraProduceMessage(jsonObj) {
  if (jsonObj.functionName == 'VideoStream') {
    var bstr = atob(jsonObj.imgBase64Str)
    // console.log("VideoStream.........");

    var n = bstr.length
    // var rDataArr = new Uint8Array(n);
    // while (n--) {
    //     rDataArr[n] = bstr.charCodeAt(n)
    // }
    if (n == jsonObj.width * jsonObj.height * 3) {
      MainContext.clearRect(0, 0, MainCanvas.width, MainCanvas.height)
      var imgData = MainContext.createImageData(jsonObj.width, jsonObj.height)
      var dataNum = 0
      for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 3] = 255
        imgData.data[i + 0] = bstr.charCodeAt(dataNum)
        imgData.data[i + 1] = bstr.charCodeAt(dataNum + 1)
        imgData.data[i + 2] = bstr.charCodeAt(dataNum + 2)
        imgData.data[i + 3] = 255
        dataNum = dataNum + 3
      }
      pMainShowStartX = jsonObj.StartX
      pMainShowStartY = jsonObj.StartY
      MainContext.putImageData(imgData, pMainShowStartX, pMainShowStartY)

      if (MainCamCutMode == 2) {
        MainContext.strokeStyle = 'blue'
        MainContext.lineWidth = 2
        MainContext.beginPath()
        MainContext.rect(pALastX, pALastY, (pACurrentX - pALastX), (pACurrentY - pALastY))
        MainContext.closePath()
        MainContext.stroke()
      }
    }
  } else if (jsonObj.functionName == 'VideoStream2') {
    var bstr = atob(jsonObj.imgBase64Str)
    var n = bstr.length
    if (n == jsonObj.width * jsonObj.height * 3) {
      AssistContext.clearRect(0, 0, AssistCanvas.width, AssistCanvas.height)
      var imgData = AssistContext.createImageData(jsonObj.width, jsonObj.height)
      var dataNum = 0
      for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 3] = 255
        imgData.data[i + 0] = bstr.charCodeAt(dataNum)
        imgData.data[i + 1] = bstr.charCodeAt(dataNum + 1)
        imgData.data[i + 2] = bstr.charCodeAt(dataNum + 2)
        imgData.data[i + 3] = 255
        dataNum = dataNum + 3
      }
      pAssistShowStartX = jsonObj.StartX
      pAssistShowStartY = jsonObj.StartY
      AssistContext.putImageData(imgData, pAssistShowStartX, pAssistShowStartY)
    }
  } else if (jsonObj.functionName == 'Cam_GetDevCount') {
    var camName = new Array()
    camName = jsonObj.DevName.split('|')

    console.log('Cam_GetDevCount > ', 'DevCount=', jsonObj.DevCount, 'camName', camName)

    GetDevCountAndNameResultCB(jsonObj.DevCount, camName)
    if (func_scan_callback) {
      func_scan_callback(jsonObj)
    }
  } else if (jsonObj.functionName == 'Cam_GetDevResolution') {
    var resArr = new Array()
    resArr = jsonObj.Resolution.split('|')
    GetResolutionResultCB(jsonObj.ResolutionCount, resArr)
    if (func_scan_callback) {
      func_scan_callback(jsonObj)
    }
  } else if (jsonObj.functionName == 'Cam_Open') {
    var status = jsonObj.success
    if (status == 0) {
      isOpenMainCamera = true
      GetCameraOnOffStatus(0)
    } else {
      isOpenMainCamera = false
      GetCameraOnOffStatus(-1)
    }
  } else if (jsonObj.functionName == 'Cam_Photo') {
    GetCaptrueImgResultCB(jsonObj.success, jsonObj.filePath, jsonObj.base64)
  } else if (jsonObj.functionName == 'Cam_ReadIdCard') {
    if (jsonObj.success == 0) {
      var resultStr = new Array()
      var decodeStr = decodeURIComponent(jsonObj.CardInfo)
      resultStr = decodeStr.split(';')
      GetIdCardInfoResultCB(jsonObj.success, resultStr[0], resultStr[1], resultStr[2], resultStr[3], resultStr[4], resultStr[5], resultStr[6], resultStr[7], resultStr[8], resultStr[9])
    } else {
      GetIdCardInfoResultCB(jsonObj.success, '', '', '', '', '', '', '', '', '', '')
    }
  } else if (jsonObj.functionName == 'UploadFile') {
    HttpResultCB(jsonObj.success, jsonObj.ResultStr)
  } else if (jsonObj.functionName == 'Cam_RecogQrBarCodeFromCamera') {
    QrBarCodeRecogResultCB(jsonObj.success, jsonObj.content)
  } else if (jsonObj.functionName == 'Cam_RecogQrBarCodeFromCamera') {
    AddImgFileToPDFResultCB(jsonObj.success, jsonObj.base64)
  } else if (jsonObj.functionName == 'Cam_AddImgFileToPDF') {
    AddImgFileToPDFResultCB(jsonObj.success, jsonObj.filepath, jsonObj.base64)
  } else if (jsonObj.functionName == 'Cam_DeletePdfImgFile') {
    DeletePdfImgFileResultCB(jsonObj.success)
  } else if (jsonObj.functionName == 'Cam_CombinePDF') {
    PdfCombineResultCB(jsonObj.success, jsonObj.base64)
  } else if (jsonObj.functionName == 'Cam_AddMergeImageFile') {
    AddMergeImageFileResultCB(jsonObj.success, jsonObj.base64)
  } else if (jsonObj.functionName == 'Cam_MergeImages') {
    MergeImagesResultCB(jsonObj.success, jsonObj.base64)
  } else if (jsonObj.functionName == 'ReadCamLicense') {
    GetLicenseResultCB(jsonObj.LisencesStr)
  } else if (jsonObj.functionName == 'GetDrives') {
    GetDriveResultCB(jsonObj.DrivesName)
  } else if (jsonObj.functionName == 'DeleteFile') {
    GetDeleteFileResultCB(jsonObj.success)
  } else if (jsonObj.functionName == 'OpenDualCamera') {
    GetOpenDualCameraResultCB(jsonObj.success)
  } else if (jsonObj.functionName == 'TakeDualCameraPhoto') {
    GetDualCameraPhotoResultCB(jsonObj.success, jsonObj.filePath1, jsonObj.Abase64, jsonObj.filePath2, jsonObj.Bbase64)
  }
}

/** ***************************************************************************************************************/

export function Heartbeat() {
  var data = JSON.stringify({ 'function': 'Heartbeat' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************获取设备数目***************
export function Cam_GetDevCount() {
  var data = JSON.stringify({ 'function': 'Cam_GetDevCount' })
  console.log('Cam_GetDevCount', data, connected)
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* **************获取分辨率***************
export function Cam_GetDevResolution(iCamNo) {
  var data = JSON.stringify({ 'function': 'Cam_GetDevResolution', 'iCamNo': iCamNo })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************打开主摄像头***************
export function Cam_Open(iCamNo, width, height) {
  var data = JSON.stringify({ 'function': 'Cam_Open', 'iCamNo': iCamNo, 'width': width, 'height': height, 'viewWidth': MainCanvas.width, 'viewHeight': MainCanvas.height })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************关闭摄像头***************
export function Cam_Close() {
  var data = JSON.stringify({ 'function': 'Cam_Close', 'iCamNo': 0 })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************拍照***************
export function Cam_Photo(filePath) {
  if (MainCamCutMode == 2) {
    var rectx, recty, rectw, recth
    if (pALastX > pACurrentX) { rectx = pACurrentX } else { rectx = pALastX }
    if (pALastY > pACurrentY) { recty = pACurrentY } else { recty = pALastY }
    rectw = Math.abs(pACurrentX - pALastX)
    recth = Math.abs(pACurrentY - pALastY)
    Cam_SetManualCutRect(rectx, recty, rectw, recth) // 手动裁剪区域
  }
  var data = JSON.stringify({ 'function': 'Cam_Photo', 'filePath': filePath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************放大***************
export function Cam_ZoomIn() {
  var data = JSON.stringify({ 'function': 'Cam_ZoomIn' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************缩小***************
export function Cam_ZoomOut() {
  var data = JSON.stringify({ 'function': 'Cam_ZoomOut' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************适合大小***************
export function Cam_BestSize() {
  var data = JSON.stringify({ 'function': 'Cam_BestSize' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************1:1***************
export function Cam_TrueSize() {
  var data = JSON.stringify({ 'function': 'Cam_TrueSize' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************旋转***************
export function Cam_Rotate(angle) {
  var data = JSON.stringify({ 'function': 'Cam_Rotate', 'angle': angle })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************左旋***************
export function Cam_RotateLeft() {
  var data = JSON.stringify({ 'function': 'Cam_RotateLeft' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************右旋***************
export function Cam_RotateRight() {
  var data = JSON.stringify({ 'function': 'Cam_RotateRight' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************对焦***************
export function Cam_Focus() {
  var data = JSON.stringify({ 'function': 'Cam_Focus' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置视频属性***************
export function Cam_ShowVideoProp() {
  var data = JSON.stringify({ 'function': 'Cam_ShowVideoProp' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置裁剪模式***************
export function Cam_SetCutMode(CutMode) {
  MainCamCutMode = CutMode
  var data = JSON.stringify({ 'function': 'Cam_SetCutMode', 'CutMode': CutMode })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置手动裁切参数***************
export function Cam_SetManualCutRect(rectx, recty, rectw, recth) {
  var data = JSON.stringify({ 'function': 'Cam_SetManualCutRect', 'rectx': rectx, 'recty': recty, 'rectw': rectw, 'recth': recth })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置自定义裁切范围***************
export function SetCustomArea(iX1, iY1, iX2, iY2) {
  var data = JSON.stringify({ 'function': 'SetCustomArea', 'iX1': iX1, 'iY1': iY1, 'iX2': iX2, 'iY2': iY2 })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************读取身份证信息*************
export function Cam_ReadIdCard(cardImgPath) {
  var data = JSON.stringify({ 'function': 'Cam_ReadIdCard', 'cardImgPath': cardImgPath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************上传文件*************
export function UploadFile(url, filepath) {
  var data = JSON.stringify({ 'function': 'UploadFile', 'url': url, 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置文件格式*************
export function Cam_SetFileType(filetype) {
  var data = JSON.stringify({ 'function': 'Cam_SetFileType', 'filetype': filetype })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置JPG图片质量*************
export function Cam_SetJpgQuality(val) {
  var data = JSON.stringify({ 'function': 'Cam_SetJpgQuality', 'quality': val })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置色彩模式*************
export function Cam_SetColorMode(colorMode) {
  var data = JSON.stringify({ 'function': 'Cam_SetColorMode', 'colorMode': colorMode })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置去黑边*************
export function Cam_SetDeleteBlackEdge(flag) {
  var data = JSON.stringify({ 'function': 'Cam_SetDeleteBlackEdge', 'flag': flag })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置去底色*************
export function Cam_SetDeleteBgColor(flag) {
  var data = JSON.stringify({ 'function': 'Cam_SetDeleteBgColor', 'flag': flag })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************从摄像头中识别二维码条码*************
export function Cam_RecogQrBarCodeFromCamera(type) {
  var data = JSON.stringify({ 'function': 'Cam_RecogQrBarCodeFromCamera', 'type': type })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************从图片文件中识别二维码条码*************
export function Cam_RecogQrBarCodeFromFile(type, filepath) {
  var data = JSON.stringify({ 'function': 'Cam_RecogQrBarCodeFromFile', 'type': type, 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************添加要合并的图片到PDF*************
export function Cam_AddImgFileToPDF(filepath) {
  var data = JSON.stringify({ 'function': 'Cam_AddImgFileToPDF', 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************删除要合并的图片到PDF*************
export function Cam_DeletePdfImgFile(filepath) {
  var data = JSON.stringify({ 'function': 'Cam_DeletePdfImgFile', 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************合并PDF*************
export function Cam_CombinePDF(filepath) {
  var data = JSON.stringify({ 'function': 'Cam_CombinePDF', 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************添加图像合并文件*************
export function Cam_AddMergeImageFile(filepath) {
  var data = JSON.stringify({ 'function': 'Cam_AddMergeImageFile', 'filePath': filepath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************图像合并*************
export function Cam_MergeImages(filepath, dir) {
  var data = JSON.stringify({ 'function': 'Cam_MergeImages', 'filePath': filepath, 'dir': dir })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************获取驱动盘符*************
export function GetDrives() {
  var data = JSON.stringify({ 'function': 'GetDrives' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************删除文件*************
export function DeleteFile(filePath) {
  var data = JSON.stringify({ 'function': 'DeleteFile', 'filePath': filePath })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************设置水印*************
export function SetWaterMark(isAdd, wType, addTime, wTransp, wPos, wSize, wColor, szInfo) {
  var data = JSON.stringify({ 'function': 'SetWaterMark', 'isAdd': isAdd, 'wType': wType, 'addTime': addTime, 'wTransp': wTransp, 'wPos': wPos, 'wSize': wSize, 'wColor': wColor, 'szInfo': szInfo })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************图像移动*************
export function MoveOffsetXY(px, py, xdir, ydir) {
  var data = JSON.stringify({ 'function': 'MoveOffsetXY', 'px': px, 'py': py, 'xdir': xdir, 'ydir': ydir })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************打开双目摄像头*************
export function OpenDualCamera() {
  var data = JSON.stringify({ 'function': 'OpenDualCamera', 'viewWidth': MainCanvas.width, 'viewHeight': MainCanvas.height, 'viewWidth2': AssistCanvas.width, 'viewHeight2': AssistCanvas.height })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* ************关闭双目摄像头*************
export function CloseDualCamera() {
  var data = JSON.stringify({ 'function': 'CloseDualCamera' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

//* *****************双目拍照****************
export function TakeDualCameraPhoto(filepath1, filepath2) {
  var data = JSON.stringify({ 'function': 'TakeDualCameraPhoto', 'filePath1': filepath1, 'filePath2': filepath2 })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

export function ReadCamLicense() {
  var data = JSON.stringify({ 'function': 'ReadCamLicense' })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

export function SetInchImgType(sizetype) {
  var data = JSON.stringify({ 'function': 'SetInchImgType', 'sizetype': sizetype })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

export function SetInchLineType(linetype) {
  var data = JSON.stringify({ 'function': 'SetInchLineType', 'linetype': linetype })
  connected ? sendMessage(data) : ConnectServer(sendMessage, data)
}

export function onMouseWheel(ev) { /* 当鼠标滚轮事件发生时，执行一些操作*/
  var ev = ev || window.event
  var down = true
  var per = 1
  down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0
  if (down) {
    Cam_ZoomOut()
  } else {
    Cam_ZoomIn()
  }
  return false
}

export function MainCanvasMouseDown(e) {
  isMouseDown = true
  pALastX = e.pageX - MainCanvas.offsetLeft
  pALastY = e.pageY - MainCanvas.offsetTop
  if (MainCamCutMode == 2) {
    pACurrentX = pALastX
    pACurrentY = pALastY
  }
}

export function MainCanvasMouseUp(e) {
  isMouseDown = false
}

export function MainCanvasMouseOut(e) {
  isMouseDown = false
}

export function MainCanvasMouseMove(e) {
  if (isMouseDown) {
    if (MainCamCutMode == 2) {
      pACurrentX = e.pageX - MainCanvas.offsetLeft
      pACurrentY = e.pageY - MainCanvas.offsetTop

      var rectx, recty, rectw, recth
      if (pALastX > pACurrentX) { rectx = pACurrentX } else { rectx = pALastX }
      if (pALastY > pACurrentY) { recty = pACurrentY } else { recty = pALastY }
      rectw = Math.abs(pACurrentX - pALastX)
      recth = Math.abs(pACurrentY - pALastY)

      Cam_SetManualCutRect(rectx, recty, rectw, recth) // 手动裁剪区域
      // console.log(rectx + "," + recty + "," + rectw + "," + recth);
    } else {
      pACurrentX = e.pageX - MainCanvas.offsetLeft
      pACurrentY = e.pageY - MainCanvas.offsetTop
      var dx = pACurrentX - pALastX
      var dy = pACurrentY - pALastY
      var xdir = 0
      var ydir = 0
      if (dx < 0) { xdir = 0 } else { xdir = 1 }
      if (dy < 0) { ydir = 0 } else { ydir = 1 }
      pALastX = pACurrentX
      pALastY = pACurrentY
      MoveOffsetXY(Math.abs(dx), Math.abs(dy), xdir, ydir)
    }
  }
}

/** **********************************************************************************************************************************************/

