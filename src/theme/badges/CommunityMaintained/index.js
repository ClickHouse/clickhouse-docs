import React from "react"
import styles from "./styles.module.css"

const Icon = () => {
  return (
    <div className={styles.CommunityMaintainedIcon} style={{ marginRight: '8px', marginTop: '4px' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.22168 4.44463V4.44463C6.22168 3.46263 7.01768 2.66663 7.99968 2.66663V2.66663C8.98168 2.66663 9.77768 3.46263 9.77768 4.44463V4.44463C9.77768 5.42663 8.98168 6.22263 7.99968 6.22263V6.22263C7.01768 6.22196 6.22168 5.42596 6.22168 4.44463Z" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M1.91309 11.5553V11.5553C1.91309 10.5733 2.70909 9.77734 3.69109 9.77734V9.77734C4.67309 9.77734 5.46909 10.5733 5.46909 11.5553V11.5553C5.46842 12.5373 4.67309 13.3333 3.69109 13.3333V13.3333C2.70909 13.3333 1.91309 12.5373 1.91309 11.5553Z" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5322 11.5553V11.5553C10.5322 10.5733 11.3282 9.77734 12.3102 9.77734V9.77734C13.2922 9.77734 14.0882 10.5733 14.0882 11.5553V11.5553C14.0882 12.5373 13.2922 13.3333 12.3102 13.3333V13.3333C11.3276 13.3333 10.5322 12.5373 10.5322 11.5553H10.5322Z" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10.5939 11.1134H5.40723" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8.95996 5.94006L11.54 9.96006" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4.45996 9.96006L7.03996 5.94006" stroke="#FBEFF8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  )
}

const CommunityMaintainedBadge = () => {
  return (
    <div className={styles.CommunityMaintainedBadge}>
      <Icon />Community Maintained
    </div>
  )
}

export default CommunityMaintainedBadge
