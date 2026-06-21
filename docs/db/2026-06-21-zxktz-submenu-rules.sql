REPLACE INTO `admin_rule`
  (`ruleid`, `rulename`, `ruletitle`, `note`, `ruleurl`, `moduleid`, `isvoid`, `createtime`, `updatetime`, `isdel`, `deltime`, `rank`)
VALUES
  (25, 'ZXTZ_QUERY_ALL', '台账-查询所有人', '', '', '', 0, '', '', 0, '', 0),
  (28, 'ZXTZ_UNRETURNED_REPORT', '未发还台账', '', '', '', 0, '', '', 0, '', 0),
  (29, 'ZXTZ_SUMMARY_REPORT', '执行款台账汇总表', '', '', '', 0, '', '', 0, '', 0),
  (30, 'ZXTZ_INCOME_QUERY', '进账查询', '', '', '', 0, '', '', 0, '', 0),
  (31, 'ZXTZ_OUTCOME_QUERY', '出账查询', '', '', '', 0, '', '', 0, '', 0),
  (32, 'ZXTZ_REFUND_RETURN_LIST', '案款发还退回清单', '', '', '', 0, '', '', 0, '', 0),
  (33, 'ZXTZ_RECEIPT_PENDING_LIST', '案款到账待开收据', '', '', '', 0, '', '', 0, '', 0);

UPDATE `admin_group`
SET `grouprule` = CASE
  WHEN FIND_IN_SET('25', `grouprule`) THEN `grouprule`
  WHEN `grouprule` IS NULL OR `grouprule` = '' THEN '25'
  ELSE CONCAT(`grouprule`, ',25')
END
WHERE `groupid` = 6;
