"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putErrorLog = exports.deleteObject = exports.generatePreSignedUrlForDownload = exports.generatePreSignedUrl = exports.copyTempObject = exports.getSecretValue = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("config"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const awsConfig = config_1.default.get('aws');
const log = config_1.default.get('log');
aws_sdk_1.default.config.update({
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region,
    apiVersions: {
        s3: '2008-10-17',
        cloudwatchlogs: '2014-03-28'
    }
});
const s3 = new aws_sdk_1.default.S3();
const cloudwatchlogs = new aws_sdk_1.default.CloudWatchLogs();
async function getSecretValue(secretName) {
    try {
        const clientSecretManager = new aws_sdk_1.default.SecretsManager();
        const data = await clientSecretManager.getSecretValue({ SecretId: secretName }).promise();
        if (data.SecretString) {
            return JSON.parse(data.SecretString);
        }
        throw new Error('NoSecretString');
    }
    catch (e) {
        if (e.code === 'DecryptionFailureException')
            throw e;
        else if (e.code === 'InternalServiceErrorException')
            throw e;
        else if (e.code === 'InvalidParameterException')
            throw e;
        else if (e.code === 'InvalidRequestException')
            throw e;
        else if (e.code === 'ResourceNotFoundException')
            throw e;
        else if (e.code === 'UnrecognizedClientException')
            throw e;
        throw e;
    }
}
exports.getSecretValue = getSecretValue;
async function copyTempObject(path, prefix = '') {
    try {
        if (!path)
            return path;
        const url = new URL(path);
        return url.href;
    }
    catch (e) {
        try {
            const targetKey = `${prefix}/${path}`;
            const params = {
                Bucket: awsConfig.bucket,
                CopySource: `${awsConfig.tempBucket}/${path}`,
                Key: `${targetKey}`,
                CacheControl: 'max-age=31536000'
            };
            await s3.copyObject(params).promise();
            return `${awsConfig.cloudfront}/${targetKey}`;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.copyTempObject = copyTempObject;
function generatePreSignedUrl(key, type, mimeType, target) {
    try {
        let path;
        switch (type) {
            case 'image':
                if (target === 'profile') {
                    path = `images/origin/profile/${key}`;
                }
                else {
                    path = `images/origin/${target}/${(0, moment_timezone_1.default)().format('YYYYMM')}/${key}`;
                }
                break;
            case 'video':
                path = `videos/${target}/${(0, moment_timezone_1.default)().format('YYYYMM')}/${key}`;
                break;
            case 'thumbnail':
                path = `videos/thumbnail/${target}/${(0, moment_timezone_1.default)().format('YYYYMM')}/${key}`;
                break;
            case 'file':
                path = `files/${target}/${(0, moment_timezone_1.default)().format('YYYYMM')}/${key}`;
                break;
            default:
                path = key;
                break;
        }
        const params = {
            Bucket: awsConfig.bucket,
            Key: path,
            ContentType: mimeType,
            Expires: 60
        };
        return {
            path,
            url: s3.getSignedUrl('putObject', params)
        };
    }
    catch (e) {
        throw e;
    }
}
exports.generatePreSignedUrl = generatePreSignedUrl;
function generatePreSignedUrlForDownload(path) {
    try {
        const params = {
            Bucket: awsConfig.bucket,
            Key: path,
            Expires: 60
        };
        return {
            path,
            url: s3.getSignedUrl('getObject', params)
        };
    }
    catch (e) {
        throw e;
    }
}
exports.generatePreSignedUrlForDownload = generatePreSignedUrlForDownload;
async function deleteObject(path) {
    try {
        if (!path)
            return 0;
        if (typeof path === 'string') {
            const result = await s3.deleteObject({ Bucket: awsConfig.bucket, Key: path }).promise();
            console.log(`Delete Target [${path}]`);
            return 1;
        }
        else if (Array.isArray(path)) {
            const deleteTargets = [];
            path.forEach((p) => {
                deleteTargets.push({ Key: p });
            });
            const result = await s3.deleteObjects({ Bucket: awsConfig.bucket, Delete: { Objects: deleteTargets } }).promise();
            console.log(`Delete Target ${JSON.stringify(deleteTargets)}`);
            console.log(result);
            return 1;
        }
        else {
            return 0;
        }
    }
    catch (e) {
        console.log(e);
        if (e.code === 'DecryptionFailureException')
            throw e;
        else if (e.code === 'InternalServiceErrorException')
            throw e;
        else if (e.code === 'InvalidParameterException')
            throw e;
        else if (e.code === 'InvalidRequestException')
            throw e;
        else if (e.code === 'ResourceNotFoundException')
            throw e;
        else if (e.code === 'UnrecognizedClientException')
            throw e;
        throw e;
    }
}
exports.deleteObject = deleteObject;
//에러로그 cloudwatch error stream에 별도 보관
async function putErrorLog(err) {
    try {
        //error logstream 정보를 가져옴(스트림 시퀸스 토큰이 필요함)
        const data = await cloudwatchlogs
            .describeLogStreams({
            logGroupName: log.group,
            logStreamNamePrefix: log.stream
        })
            .promise();
        const sequenceToken = data.logStreams.length ? data.logStreams[0].uploadSequenceToken : undefined;
        //해당 logstream에 log 작성
        await cloudwatchlogs
            .putLogEvents({
            logEvents: [
                {
                    message: JSON.stringify(err),
                    timestamp: Date.now()
                }
            ],
            logGroupName: log.group,
            logStreamName: log.stream,
            sequenceToken: sequenceToken
        })
            .promise();
        return;
    }
    catch (e) {
        //error logstream이 없는 경우 생성후 다시 로그 함수를 호출하도록 처리(최초1회 로그스트림 자동 생성용도)
        if (e.code === 'ResourceNotFoundException') {
            await cloudwatchlogs
                .createLogStream({
                logGroupName: log.group,
                logStreamName: log.stream
            })
                .promise();
            await putErrorLog(err);
        }
        else
            return;
    }
}
exports.putErrorLog = putErrorLog;
