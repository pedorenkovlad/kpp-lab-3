+function(){
    $(function(){
        const pomdo = {
            init () {
                this.domCache();
                this.eventBind();
            },
            domCache () {
                this.$todoList = $('#incompletedTasksContainer');
                this.$completedList = $('#completedTasks');
            },
            eventBind () {
                this.$todoList.on("click", "i.fa-times", this.removeTask);
                this.$todoList.on("click", "i.fa-check", this.completeTask);
                this.$completedList.on("click", "i.fa-check", this.removeTask);
            },
            removeTask (e) {
                let $taskDiv = $(e.target).closest('div');
                let $taskId = $taskDiv.attr('data-find');
                
                $.ajax({
                    url: `/remove/${$taskId}`,
                    method: 'DELETE',
                    success: response => {
                        location.reload();  // Reload page to re-render view
                    },
                    error: () => {
                        alert('There was an error with your request, please try again');
                    }
                });
            },
            completeTask (e) {
                e.preventDefault();
                let $taskDiv = $(e.target).closest('div');
                let $taskId = $taskDiv.attr('data-find');

                $.ajax({
                    url: '/tasks',
                    data: { taskId: $taskId } ,
                    method: 'PUT',
                    success: response => {
                        location.reload();  // Reload page to re-render view
                    },
                    error: () => {
                        alert('There was an error with your request, please try again');
                    }
                });
            }


        }
        pomdo.init();
    });
}(jQuery)