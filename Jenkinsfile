pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd web && npm install'
            }
        }
        stage('deploy') {
            steps {
                sh 'echo Killing existing process $( ps aux | grep "kanjiLearning" | grep -v grep | awk \'{ print $2 }\' )'
                sh 'chmod +x kill'
                sh './kill'   
                echo 'Starting new process'
                sh 'cd web && node kanjiLearning.js >>log.txt 2>>log.txt &'
            }
        }
    }
}