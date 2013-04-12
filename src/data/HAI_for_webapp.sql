select /*
provider_id,hospital_name,clabsi_ratio,cauti_ratio,ssicolon_ratio
*/
provider_id,hospital_name,address_1,city,state,zip_code,county_name,CAUTI_ratio,CAUTI_lower,CAUTI_observed,CAUTI_predicted,CAUTI_upper,CLABSI_ratio,CLABSI_lower,CLABSI_observed,CLABSI_predicted,CLABSI_upper,SSIcolon_ratio,SSIcolon_lower,SSIcolon_observed,SSIcolon_predicted,SSIcolon_upper

from `HAI_transposed`
where provider_id in (
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
order by provider_id

