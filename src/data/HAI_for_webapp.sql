select 
/*
a.provider_id,b.hospital_name,a.clabsi_ratio,a.cauti_ratio,a.ssicolon_ratio,
a.clabsi_observed, a.cauti_observed, a.ssicolon_observed,
a.clabsi_predicted, a.cauti_predicted, a.ssicolon_predicted
*/
a.provider_id,b.hospital_name,a.address_1,a.city,a.state,a.zip_code,a.county_name,
a.CAUTI_ratio,a.CAUTI_lower,a.CAUTI_observed,a.CAUTI_predicted,a.CAUTI_upper,
a.CLABSI_ratio,a.CLABSI_lower,a.CLABSI_observed,a.CLABSI_predicted,a.CLABSI_upper,
a.SSIcolon_ratio,a.SSIcolon_lower,a.SSIcolon_observed,a.SSIcolon_predicted,a.SSIcolon_upper

from HAI_transposed_20130418 a
join hospital_names b on a.provider_id = b.provider_id
where a.provider_id in (
  "110115",
  "110076",
  "110226",
  "110230",
  "110078",
  "110192",
  "110183",
  "110010",
  "110079",
  "110087",
  "110198",
  "110161",
  "110008",
  "110005",
  "110215",
  "110191",
  "110083",
  "110229",
  "110091",
  "110219",
  "110165",
  "110082",
  "110143",
  "110184",
  "110035",
  "110042"
)
order by clabsi_ratio desc


