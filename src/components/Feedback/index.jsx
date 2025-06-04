import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Popover, Title, RadioGroup, TextAreaField, Button, Panel, Text} from '@clickhouse/click-ui/bundled'
import { getGoogleAnalyticsUserIdFromBrowserCookie } from '../../lib/google/google'
import { useColorMode } from '@docusaurus/theme-common'
import styles from './styles.module.scss'
import clsx from 'clsx'

export default function Feedback({side}) {
  const [open, setOpen] = useState(false);
  const [negResponse, setNegResponse] = useState('');
  const [comment, setComment] = useState('');
  const [selected, setSelected] = useState('');

  const handleClick = (response) => {
    //send row with google id, up or down 
    setSelected(response ? 'pos': 'neg')
    if (!response) {
        setOpen(true);
    }
  };

  const handleSubmit = async (response) => {
    setOpen(false);

    let gaId = getGoogleAnalyticsUserIdFromBrowserCookie('_ga')
    const data = {
        page_url: window.location.href,
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sentiment: response  ? 'Positive' : 'Negative',
        reason: response ? '' : negResponse,
        google_id: gaId || 'anonymous',
        comment: !response ? comment: '',
    };

    const insertQuery = `
        INSERT INTO docs_feedback.feedback (page_url, date, sentiment, reason, google_id, comment)
        VALUES
        ('${data.page_url}', '${data.date}', '${data.sentiment}', '${data.reason}', '${data.google_id}', '${data.comment.replace(/'/g, "''")}')
    `;
    try {
        const response = await fetch('https://sql-clickhouse.clickhouse.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: insertQuery,
          headers: {
            'x-clickhouse-user': 'docs_feedback',
            'x-clickhouse-key': '',
            'Content-Type': 'text/plain',
          }
        });
    
        if (!response.ok) {
          console.error('Failed to insert feedback:', await response.text());
        } else {
          console.log('Feedback submitted successfully');
        }
      } catch (err) {
        console.error('Error submitting feedback:', err);
    }
  }

    const popoverRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                if (open) {
                    handleSubmit(false);
                }
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);



  const negative_feedback = (
    <Popover.Content  side={side} align='end' showArrow={true}>
        <div ref={popoverRef}>
            <div className='flex justify-between items-center mb-[4px]'>
                <Title size='md'>Why was it not helpful?</Title>
                <IconButton size='xs' icon='cross' onClick={() => handleSubmit(false) } type='ghost'/>
            </div>
            
            <RadioGroup
                orientation='vertical'
                value={negResponse}
                onValueChange={setNegResponse}
            >
                <div className='flex mt-[4px] flex-col'>
                    <RadioGroup.Item  value='missing_info' label='Missing information' />
                    <RadioGroup.Item value='confusing' label='Hard to follow or confusing'/>
                    <RadioGroup.Item value='inaccurate' label="Inaccurate, out of date, or doesn't work"/>
                    <RadioGroup.Item value='other' label='Something else'/>

                    <div className='mt-[10px] mb-[10px]'>
                        <TextAreaField placeholder='Additional feedback (optional)' type="text" value={comment} onChange={(value) => setComment(value)}/>
                    </div>
                    <Button label='Submit' onClick={() => handleSubmit(false)}/>
                </div>
            </RadioGroup>
        </div>
    </Popover.Content>
  )

  const { colorMode } = useColorMode();

  const getStroke = (highlighted, colorMode) => {
    if (colorMode === 'light') {
      return highlighted ? '#000' : '#696E79';
    } else {
      return highlighted ? '#FAFF69' : '#B3B6BD';
    }
  };
  
  const ThumbsUp = ({ highlighted, colorMode }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="thumbs-up"
      style={{ display: 'block', margin: 'auto' }}
    >
      <g clipPath="url(#clip0_110_3987)">
        <path
          d="M2 6.5H5V13H2C1.86739 13 1.74021 12.9473 1.64645 12.8536C1.55268 12.7598 1.5 12.6326 1.5 12.5V7C1.5 6.86739 1.55268 6.74021 1.64645 6.64645C1.74021 6.55268 1.86739 6.5 2 6.5Z"
          stroke={getStroke(highlighted, colorMode)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 6.5L7.5 1.5C8.03043 1.5 8.53914 1.71071 8.91421 2.08579C9.28929 2.46086 9.5 2.96957 9.5 3.5V5H13.5C13.6419 5.00004 13.7821 5.03026 13.9113 5.08865C14.0406 5.14704 14.156 5.23227 14.2498 5.33867C14.3436 5.44507 14.4137 5.57021 14.4555 5.70579C14.4972 5.84136 14.5096 5.98426 14.4919 6.125L13.7419 12.125C13.7114 12.3666 13.5939 12.5888 13.4113 12.7499C13.2286 12.911 12.9935 12.9999 12.75 13H5"
          stroke={getStroke(highlighted, colorMode)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_110_3987">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );


  const ThumbsDown = ({ highlighted, colorMode }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="thumbs-down"
      style={{ display: 'block', margin: 'auto' }}
    >
      <g clipPath="url(#clip0_110_3992)">
        <path
          d="M2 3H5V9.5H2C1.86739 9.5 1.74021 9.44732 1.64645 9.35355C1.55268 9.25979 1.5 9.13261 1.5 9L1.5 3.5C1.5 3.36739 1.55268 3.24021 1.64645 3.14645C1.74021 3.05268 1.86739 3 2 3Z"
          stroke={getStroke(highlighted, colorMode)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 9.5L7.5 14.5C8.03043 14.5 8.53914 14.2893 8.91421 13.9142C9.28929 13.5391 9.5 13.0304 9.5 12.5V11H13.5C13.6419 11 13.7821 10.9697 13.9113 10.9114C14.0406 10.853 14.156 10.7677 14.2498 10.6613C14.3436 10.5549 14.4137 10.4298 14.4555 10.2942C14.4972 10.1586 14.5096 10.0157 14.4919 9.875L13.7419 3.875C13.7114 3.63339 13.5939 3.41119 13.4113 3.25009C13.2286 3.08899 12.9935 3.00007 12.75 3L5 3"
          stroke={getStroke(highlighted, colorMode)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_110_3992">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  
  return (
    <div className={styles.displayFeedback}>
    <Panel hasBorder alignItems='start'>
    <Popover open={open} >
        <Popover.Trigger>
            <div>
                <Text size='lg' color='muted' weight='semibold'>Was this page helpful?</Text>
            </div>
            <div className='mt-[8px] flex'>
                <div className={clsx( styles.Button, colorMode === 'dark' ? styles.dark : styles.light, selected === 'pos' && styles.selected )} onClick={() => { handleClick(true); handleSubmit(true)}}>
                    <ThumbsUp highlighted={selected === 'pos'} colorMode={colorMode}/>
                </div>

                <div className={clsx( styles.Button, colorMode === 'dark' ? styles.dark : styles.light, selected === 'neg' && styles.selected )} onClick={() => handleClick(false)}>
                    <ThumbsDown highlighted={selected === 'neg'} colorMode={colorMode}/>
                </div>
            </div>
            
        </Popover.Trigger>
        {
            selected === 'neg' && negative_feedback
        }
      </Popover>
    </Panel>
    </div>
  );
}
