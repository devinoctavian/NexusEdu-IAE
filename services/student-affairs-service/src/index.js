import express from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';
import soap from 'strong-soap';

const logger = pino();
const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: { service: 'student-affairs-service', status: 'UP' },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

// Setup mock SOAP endpoint for legacy integration demo
const myService = {
  StudentAttendanceLegacyService: {
    AttendancePort: {
      RecordAttendance: function(args) {
        return {
          status: 'SUCCESS',
          message: 'Attendance recorded successfully for ' + args.studentNim
        };
      }
    }
  }
};

const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="StudentAttendance"
             targetNamespace="http://legacy.nexusedu.id/attendance"
             xmlns:tns="http://legacy.nexusedu.id/attendance"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             xmlns="http://schemas.xmlsoap.org/wsdl/">
  <message name="RecordAttendanceRequest">
    <part name="studentNim" type="xsd:string"/>
    <part name="courseId" type="xsd:string"/>
    <part name="status" type="xsd:string"/>
  </message>
  <message name="RecordAttendanceResponse">
    <part name="status" type="xsd:string"/>
    <part name="message" type="xsd:string"/>
  </message>
  <portType name="AttendancePortType">
    <operation name="RecordAttendance">
      <input message="tns:RecordAttendanceRequest"/>
      <output message="tns:RecordAttendanceResponse"/>
    </operation>
  </portType>
  <binding name="AttendanceBinding" type="tns:AttendancePortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="RecordAttendance">
      <soap:operation soapAction="RecordAttendance"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  <service name="StudentAttendanceLegacyService">
    <port name="AttendancePort" binding="tns:AttendanceBinding">
      <soap:address location="http://localhost:8005/soap/attendance"/>
    </port>
  </service>
</definitions>`;

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => {
  // Use strong-soap to attach SOAP server
  soap.soap.listen(app, '/soap/attendance', myService, wsdl, function() {
    logger.info(`Student Affairs Service (SOAP enabled) listening on port ${PORT}`);
  });
});
