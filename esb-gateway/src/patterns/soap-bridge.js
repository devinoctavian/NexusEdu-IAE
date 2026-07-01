import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export async function soapBridge(req, res) {
  // Translate REST (JSON) to SOAP (XML)
  const { studentNim, courseId, status } = req.body;
  
  const builder = new XMLBuilder({ ignoreAttributes: false });
  // Construct the SOAP Envelope manually or using a library
  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <RecordAttendance xmlns="http://legacy.nexusedu.id/attendance">
      <studentNim>${studentNim}</studentNim>
      <courseId>${courseId}</courseId>
      <status>${status}</status>
    </RecordAttendance>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch('http://localhost:8005/soap/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'SOAPAction': 'RecordAttendance'
      },
      body: soapRequest
    });

    const textResponse = await response.text();
    
    // Parse SOAP XML Response back to JSON
    const parser = new XMLParser();
    const jsonObj = parser.parse(textResponse);
    
    // Extract body (this is a naive extraction depending on exact WSDL format)
    const envelope = jsonObj['soap:Envelope'] || jsonObj['Envelope'];
    const body = envelope['soap:Body'] || envelope['Body'];
    
    res.json({
      status: 'success',
      data: { parsedSoapResponse: body },
      meta: { timestamp: new Date().toISOString() },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'SOAP_BRIDGE_ERROR', detail: error.message }]
    });
  }
}
