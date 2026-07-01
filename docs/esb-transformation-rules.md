# ESB Transformation Rules (REST ↔ SOAP)

## 1. Input Transformation (REST JSON -> SOAP XML)

Payload JSON yang masuk ke ESB dari client REST:
```json
POST /api/v1/student-affairs/attendance
{
  "studentNim": "1301190001",
  "courseId": "IF3110",
  "status": "PRESENT"
}
```

Dikonversi oleh `fast-xml-parser` di ESB Gateway menjadi *SOAP Request* (XML):
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <RecordAttendance xmlns="http://legacy.nexusedu.id/attendance">
      <studentNim>1301190001</studentNim>
      <courseId>IF3110</courseId>
      <status>PRESENT</status>
    </RecordAttendance>
  </soap:Body>
</soap:Envelope>
```

## 2. Output Transformation (SOAP XML -> REST JSON)

*SOAP Response* yang diterima ESB dari `student-affairs-service` (Legacy DB):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <RecordAttendanceResponse xmlns="http://legacy.nexusedu.id/attendance">
      <status>SUCCESS</status>
      <message>Attendance recorded successfully for 1301190001</message>
    </RecordAttendanceResponse>
  </soap:Body>
</soap:Envelope>
```

Dikonversi oleh `fast-xml-parser` dan direstrukturisasi kembali oleh ESB menjadi standard API envelop:
```json
{
  "status": "success",
  "data": {
    "parsedSoapResponse": {
      "RecordAttendanceResponse": {
        "status": "SUCCESS",
        "message": "Attendance recorded successfully for 1301190001"
      }
    }
  },
  "meta": {
    "timestamp": "2026-07-01T10:00:00Z"
  },
  "errors": null
}
```
