const reportService = require('../services/report.service');

async function getCaseFilesSummary(req, res, next) {
  try {
    const { fromDate, toDate, statusId } = req.query;

    let statusIdInt = null;

    if (statusId !== undefined) {
      const parsed = parseInt(statusId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({
          message: 'statusId debe ser numérico'
        });
      }
      statusIdInt = parsed;
    }

    const summary = await reportService.getCaseFilesSummary({
      fromDate: fromDate || null,
      toDate: toDate || null,
      statusId: statusIdInt
    });

    return res.json({
      period: {
        fromDate: fromDate || null,
        toDate: toDate || null
      },
      totalCaseFiles: summary.totalCaseFiles,
      byStatus: summary.byStatus
    });
  } catch (error) {
    next(error);
  }
}

async function getCaseFilesDetail(req, res, next) {
  try {
    const {
      fromDate,
      toDate,
      statusId,
      createdByUserId,
      caseFileId
    } = req.query;

    let statusIdInt = null;
    let createdByUserIdInt = null;
    let caseFileIdInt = null;

    if (statusId !== undefined) {
      const parsed = parseInt(statusId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: 'statusId debe ser numérico' });
      }
      statusIdInt = parsed;
    }

    if (createdByUserId !== undefined) {
      const parsed = parseInt(createdByUserId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: 'createdByUserId debe ser numérico' });
      }
      createdByUserIdInt = parsed;
    }

    if (caseFileId !== undefined) {
      const parsed = parseInt(caseFileId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: 'caseFileId debe ser numérico' });
      }
      caseFileIdInt = parsed;
    }

    const detailRows = await reportService.getCaseFilesDetail({
      fromDate: fromDate || null,
      toDate: toDate || null,
      statusId: statusIdInt,
      createdByUserId: createdByUserIdInt,
      caseFileId: caseFileIdInt
    });

    return res.json({
      period: {
        fromDate: fromDate || null,
        toDate: toDate || null
      },
      filters: {
        statusId: statusIdInt,
        createdByUserId: createdByUserIdInt,
        caseFileId: caseFileIdInt
      },
      items: detailRows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCaseFilesSummary,
  getCaseFilesDetail
};
