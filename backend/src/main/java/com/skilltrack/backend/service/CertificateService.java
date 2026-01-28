package com.skilltrack.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class CertificateService {

    public byte[] generateCertificate(String studentName, String courseName, String date, String verifyUrl) throws DocumentException, IOException {
        // 1. Create Document (Landscape Mode)
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();

        // 2. Draw Decorative Border
        PdfContentByte canvas = writer.getDirectContent();
        canvas.setColorStroke(new java.awt.Color(16, 185, 129)); // SkillTrack Green (#10B981)
        canvas.setLineWidth(10);
        canvas.rectangle(20, 20, document.getPageSize().getWidth() - 40, document.getPageSize().getHeight() - 40);
        canvas.stroke();

        // 3. Add Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36, new java.awt.Color(51, 65, 85));
        Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingBefore(40);
        document.add(title);

        // 4. Add Subtitle
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 18, new java.awt.Color(100, 116, 139));
        Paragraph subTitle = new Paragraph("This is to certify that", subTitleFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingBefore(30);
        document.add(subTitle);

        // 5. Add Student Name
        Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 40, new java.awt.Color(15, 23, 42));
        Paragraph name = new Paragraph(studentName, nameFont);
        name.setAlignment(Element.ALIGN_CENTER);
        name.setSpacingBefore(10);
        document.add(name);

        // 6. Add Course Text
        Paragraph body = new Paragraph("has successfully completed the course", subTitleFont);
        body.setAlignment(Element.ALIGN_CENTER);
        body.setSpacingBefore(10);
        document.add(body);

        Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, new java.awt.Color(16, 185, 129));
        Paragraph course = new Paragraph(courseName, courseFont);
        course.setAlignment(Element.ALIGN_CENTER);
        course.setSpacingBefore(10);
        document.add(course);

        // 7. Add Date
        Paragraph dateText = new Paragraph("Date: " + date, subTitleFont);
        dateText.setAlignment(Element.ALIGN_CENTER);
        dateText.setSpacingBefore(40);
        document.add(dateText);

        // 8. Generate & Add QR Code
        try {
            Image qrImage = generateQRCodeImage(verifyUrl);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            qrImage.scaleAbsolute(100, 100);
            qrImage.setSpacingBefore(20);
            document.add(qrImage);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 9. Add Footer ID
        Font footerFont = FontFactory.getFont(FontFactory.COURIER, 10, java.awt.Color.GRAY);
        Paragraph footer = new Paragraph("Verify at: " + verifyUrl, footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(10);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private Image generateQRCodeImage(String text) throws Exception {
        QRCodeWriter barcodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = barcodeWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
        
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        
        return Image.getInstance(pngOutputStream.toByteArray());
    }
}