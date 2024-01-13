import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import expressionParser from "docxtemplater/expressions.js";

import ImageModule from 'docxtemplater-image-module-free'


export const generateDocument = (
    name,
    path,
    data,
) => {

    const imageOptions = {
        centered: false,
        getImage(url) {
            return new Promise(function (resolve, reject) {
                PizZipUtils.getBinaryContent(
                    url,
                    function (error, content) {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(content);
                    }
                );
            });
        },
        getSize(img, url, tagName) {
            if(data[`${tagName}_SIZE`])return data[`${tagName}_SIZE`];

            return new Promise(function (resolve, reject) {
                const image = new Image();
                image.src = url;
                image.onload = function () {
                    resolve([image.width, image.height]);
                };
                image.onerror = function (e) {
                    console.log(
                        "img, url, tagName : ",
                        img,
                        url,
                        tagName
                    );
                    alert(
                        "An error occured while loading " +
                            url
                    );
                    reject(e);
                };
            });
        },
    };

    const imageModule = new ImageModule(imageOptions);

    PizZipUtils.getBinaryContent(
        path,
        function (error, content) {
            if (error) {
                console.error(error);
                return;
            }

            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                parser: expressionParser,
                modules: [imageModule],
            });

            doc
            .renderAsync(data)
            .then(function () {
                const out = doc.getZip().generate({
                    type: "blob",
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                });
                saveAs(out, name+".docx");
            });
        }
    );
}