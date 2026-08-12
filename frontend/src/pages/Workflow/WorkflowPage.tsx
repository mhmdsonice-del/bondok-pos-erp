export default function WorkflowPage() {
  return (
    <div className="view-enter">
      <div className="sh"><h3>🔀 بناء سير العمل</h3><button className="btn btn-pr btn-sm"><i className="fa fa-plus"/> سير جديد</button></div>
      <div className="card" style={{textAlign:'center',padding:48}}>
        <div className="empty"><i className="fa fa-diagram-project" style={{fontSize:48}}/><p style={{marginTop:12,fontSize:15}}>قريباً — محرر سير العمل البصري</p><p style={{marginTop:4,fontSize:13}}>Drag-and-drop Workflow Builder</p></div>
      </div>
    </div>
  );
}
