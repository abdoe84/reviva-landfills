const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const xlsx = require('xlsx');
const chokidar = require('chokidar');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// مسار ملف Excel
const excelFilePath = path.join(__dirname, 'C:/Users/fayad/OneDrive - Global Environmental Management Services (GEMS)/Desktop/my depart/Landfills/data.xlsx');

// إعداد مجلد العرض الثابت
app.use(express.static(path.join(__dirname, 'public')));

// دالة لقراءة بيانات Excel وتحويلها إلى JSON
const readExcel = () => {
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData;
};

// عند اتصال العميل
io.on('connection', (socket) => {
    console.log('عميل متصل');

    // إرسال البيانات الأولية عند الاتصال
    const data = readExcel();
    socket.emit('excelData', data);

    socket.on('disconnect', () => {
        console.log('عميل فصل الاتصال');
    });
});

// مراقبة تغييرات ملف Excel
chokidar.watch(excelFilePath).on('change', () => {
    console.log('تم تغيير ملف Excel');
    const updatedData = readExcel();
    io.emit('excelData', updatedData);
});

// بدء الخادم
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

