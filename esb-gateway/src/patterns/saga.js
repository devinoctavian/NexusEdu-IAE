import fetch from 'node-fetch';

export async function enrollmentSaga(req, res) {
  // Saga Pattern: Enroll -> Check Finance -> Enroll Academic -> Produce Message
  const { studentNim, courseId } = req.body;

  try {
    // 1. Finance Check (Local Transaction)
    const financeRes = await fetch(\`http://localhost:8003/api/v1/finance/invoices/unpaid/\${studentNim}\`);
    const financeData = await financeRes.json();
    
    if (financeRes.status !== 200) {
      // Compensating action or abort
      return res.status(403).json(financeData);
    }

    // 2. Academic Enrollment (Assume endpoint exists in Academic service)
    // const academicRes = await fetch('http://localhost:8002/api/v1/academic/enrollments', { method: 'POST', body: ... })
    
    // 3. (Mocked Success) Notify via RabbitMQ
    // (RabbitMQ publish logic would go here via amqplib)

    res.json({
      status: 'success',
      data: { studentNim, courseId, status: 'ENROLLED' },
      meta: { timestamp: new Date().toISOString() },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'SAGA_FAILED', detail: 'Enrollment saga failed' }]
    });
  }
}
