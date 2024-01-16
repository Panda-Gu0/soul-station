import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    async create(file: Express.Multer.File) {
        if (!file) {
            return {
                code: 400,
                message: '只允许上传图片!'
            };
        }
        return {
            data: `http://localhost:3000/static/${file.filename}`
        };
    }
}
