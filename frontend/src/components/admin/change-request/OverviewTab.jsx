import React from 'react';
import FinalOutcomeCard from './FinalOutcomeCard';
import MakeExectionGraph from './MakeExectionGraph';

const OverviewTab = ({ request, transaction }) => {
    return (
        <div className="flex flex-col gap-6 flex-1 h-full">
            {/* 
                We have removed the Amendment Header to strictly match the 
                requested visual layout and minimize vertical footprint.
            */}
            <FinalOutcomeCard request={request} />
            <MakeExectionGraph status={request.status} />
        </div>
    );
};

export default OverviewTab;
