// 引入所需的库和模块
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

// 创建 Express 应用
const app = express();
app.use(bodyParser.json());

// 定义语言学习平台类
class LanguageLearningPlatform {
    constructor() {
        this.courses = [];
        this.lessons = [];
        this.proficiencyLevels = ['beginner', 'intermediate', 'advanced'];
        this.features = ['speech'];
    }

    // 添加课程
    addCourse(course) {
        this.courses.push(course);
    }

    // 添加课程
    addLesson(lesson) {
        this.lessons.push(lesson);
    }

    // 获取所有课程
    getAllCourses() {
        return this.courses;
    }

    // 获取所有课程
    getAllLessons() {
        return this.lessons;
    }

    // 检查是否支持语音功能
    supportsSpeech() {
        return this.features.includes('speech');
    }

    // 调用文本到语音服务
    async textToSpeech(text) {
        try {
            const textToSpeech = new TextToSpeechV1({
                authenticator: new IamAuthenticator({ apikey: 'YOUR_API_KEY' }),
                serviceUrl: 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/YOUR_INSTANCE_ID',
            });

            const params = {
                text,
                voice: 'en-US_AllisonV3Voice',
                accept: 'audio/wav',
            };

            const response = await textToSpeech.synthesize(params);
            const audio = response.result;
            return audio;
        } catch (error) {
            console.error("Error converting text to speech:", error);
            throw error;
        }
    }
}

// 创建语言学习平台实例
const languagePlatform = new LanguageLearningPlatform();

// 添加课程
languagePlatform.addCourse("Spanish for Beginners");
languagePlatform.addCourse("French Intermediate Level");
languagePlatform.addCourse("Advanced German Grammar");

// 添加课程
languagePlatform.addLesson("Greetings and Introductions");
languagePlatform.addLesson("Daily Conversation Practice");
languagePlatform.addLesson("Business Vocabulary");

// 创建路由
app.get('/courses', (req, res) => {
    const courses = languagePlatform.getAllCourses();
    res.json({ courses });
});

app.get('/lessons', (req, res) => {
    const lessons = languagePlatform.getAllLessons();
    res.json({ lessons });
});

app.post('/text-to-speech', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: "Text is required." });
        return;
    }

    if (!languagePlatform.supportsSpeech()) {
        res.status(400).json({ error: "Speech feature is not supported." });
        return;
    }

    try {
        const audio = await languagePlatform.textToSpeech(text);
        res.set('Content-Type', 'audio/wav');
        res.send(audio);
    } catch (error) {
        res.status(500).json({ error: "Failed to convert text to speech." });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
